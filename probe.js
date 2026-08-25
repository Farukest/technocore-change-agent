"use strict";

// Everything that reads technocore.chat and turns it into a comparable snapshot.
// No key, no writes. Kept separate so the measuring half stays runnable anywhere.

const crypto = require("node:crypto");

const BASE = "https://technocore.chat";
const FAUCET_WORDS = /\b(faucet|testnet|airdrop|claim|token|mint|drip)\b/gi;

async function get(path, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { accept: "text/plain", connection: "close" },
      signal: controller.signal,
    });
    return { status: response.status, body: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function sha(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

function lastSeq(roomsHeader) {
  const m = /range \d+\.\.(\d+)/.exec(roomsHeader);
  return m ? Number(m[1]) : null;
}

// Two reads a minute apart give the message rate, which is what decides how long
// anything posted to a busy room stays inside the 200-message read window.
async function lobbyWindow(sampleMs = 60000) {
  const a = lastSeq((await get("/r/lobby")).body);
  await new Promise((r) => setTimeout(r, sampleMs));
  const b = lastSeq((await get("/r/lobby")).body);
  if (a === null || b === null || b <= a) return null;
  const perMinute = Math.round(((b - a) * 60000) / sampleMs);
  return { perMinute, windowSeconds: Math.round((200 * 60) / perMinute) };
}

function faucetHits(text) {
  const hits = text.match(FAUCET_WORDS);
  return hits ? [...new Set(hits.map((h) => h.toLowerCase()))].sort() : [];
}

async function snapshot({ sampleMs } = {}) {
  const [agentJson, llms, rooms] = await Promise.all([
    get("/.well-known/agent.json"),
    get("/llms.txt"),
    get("/rooms"),
  ]);

  let manifest = {};
  try {
    manifest = JSON.parse(agentJson.body);
  } catch {
    manifest = {};
  }

  const roomsHeader = rooms.body.split("\n")[0] || "";
  const roomCount = /of (\d+) rooms/.exec(roomsHeader);
  const roomCap = /cap (\d+)/.exec(roomsHeader);

  return {
    at: new Date().toISOString(),
    version: manifest.version || null,
    capabilities: (manifest.capabilities || []).map((c) => c.name).sort(),
    limits: manifest.limits || null,
    llmsHash: sha(llms.body),
    llmsBytes: llms.body.length,
    roomsListed: roomCount ? Number(roomCount[1]) : null,
    roomsCap: roomCap ? Number(roomCap[1]) : null,
    faucet: [...new Set([...faucetHits(JSON.stringify(manifest)), ...faucetHits(llms.body)])],
    lobby: await lobbyWindow(sampleMs),
  };
}

module.exports = { snapshot, get, sha, BASE };
