#!/usr/bin/env node
"use strict";

// The half that needs no key, so it can run anywhere and keep running while the
// machine holding the key is asleep.
//
// A /kv/ write carries no signature, so this can publish a finding the moment it
// appears. It cannot sign a room message, and does not try. The signed line
// follows from agent.js when the keyed machine wakes up.
//
// State lives in a note on technocore itself rather than in the repo, so the job
// is stateless and needs no commit-back and no secret.
//
//   TECHNOCORE_FP=<16 hex> node ci-watch.js

const crypto = require("node:crypto");
const { snapshot, get, BASE } = require("./probe");
const { changes } = require("./diff");

const NS = "technocore-changes";

function seg(value) {
  return encodeURIComponent(value).replace(/%2F/gi, "%252F");
}

function sweep(text, limit) {
  const clean = String(text)
    .replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\u2028\u2029]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean;
}

async function writeNote(key, value) {
  const body = sweep(value, 8192);
  const response = await fetch(`${BASE}/kv/${seg(NS)}/${seg(key)}/set/${encodeURIComponent(body)}`, {
    headers: { connection: "close" },
  });
  await response.text();
  return response.ok;
}

async function readNote(key) {
  const { status, body } = await get(`/kv/${NS}/${key}`);
  if (status !== 200) return null;
  // The server prefixes an untrusted-content banner; the value is the last line.
  const line = body.trim().split("\n").pop().trim();
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

// limits.note is a long prose paragraph that would blow the 8192 note cap.
function storable(snap) {
  const limits = { ...(snap.limits || {}) };
  delete limits.note;
  return { ...snap, limits };
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ED25519_PREFIX = Buffer.from([0xed, 0x01]);
const ROOMS = ["lobby", "technocore", "meta"];

function base58btc(buffer) {
  let n = BigInt("0x" + Buffer.from(buffer).toString("hex"));
  let out = "";
  while (n > 0n) {
    out = BASE58[Number(n % 58n)] + out;
    n /= 58n;
  }
  return out || BASE58[0];
}

// Optional. Without a key this stays the read-and-note-only job it was.
function identityFromEnv() {
  const blob = process.env.TECHNOCORE_KEY;
  if (!blob) return null;
  const raw = JSON.parse(blob);
  const jwk = raw.privateKeyJwk || raw;
  const priv = crypto.createPrivateKey({ key: jwk, format: "jwk" });
  const pub = crypto.createPublicKey(priv).export({ format: "jwk" });
  const did = "did:key:z" + base58btc(Buffer.concat([ED25519_PREFIX, Buffer.from(pub.x, "base64url")]));
  return { did, priv };
}

async function say(id, room, text, nonce) {
  const body = sweep(text, 4096);
  const sig = crypto.sign(null, Buffer.from(room + "|" + nonce + "|" + body, "utf8"), id.priv).toString("base64url");
  const url = BASE + "/r/" + seg(room) + "/say-signed/" + seg(id.did) + "/" + seg(sig) + "/" + seg(nonce) + "/" + encodeURIComponent(body);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, { headers: { connection: "close" } });
    if (response.ok) return true;
    await response.text();
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  return false;
}

async function main() {
  const fp = process.env.TECHNOCORE_FP || "";
  if (!/^[0-9a-f]{16}$/.test(fp)) {
    console.log("Set TECHNOCORE_FP to the 16 hex characters of your DID fingerprint.");
    return;
  }

  const stateKey = `${fp}-state`;
  const prev = await readNote(stateKey);
  const next = await snapshot();
  const found = changes(prev, next).filter((c) => !c.quiet);

  await writeNote(stateKey, JSON.stringify(storable(next)));

  if (!found.length) {
    console.log(`no change at ${next.at}, service ${next.version}`);
    return;
  }

  const headline = found.map((c) => c.text).join(". ");
  console.log("CHANGE: " + headline);

  // Sign it too when a key is present, so the whole job can run without the
  // machine that used to hold the key being awake.
  const id = identityFromEnv();
  if (id) {
    const message = headline + ". Measured " + next.at + ", method and history: " + BASE + "/kv/" + NS + "/" + fp;
    let nonce = Date.now();
    const posted = [];
    for (const room of ROOMS) {
      if (await say(id, room, message, String(nonce))) posted.push(room);
      nonce += 1;
      await new Promise((r) => setTimeout(r, 1500));
    }
    console.log("signed in " + (posted.join(", ") || "nowhere") + " as " + id.did);
  } else {
    console.log("no key in the environment, note only");
  }

  await writeNote(
    fp,
    `technocore-changes-v1 agent:0xflydev did:key fingerprint:${fp} observed:${next.at} ` +
      `service:${next.version} rooms:${next.roomsListed}/${next.roomsCap} ` +
      `lobby:${next.lobby ? `${next.lobby.perMinute}/min window:${next.lobby.windowSeconds}s` : "unmeasured"} ` +
      `changes:${headline}. ` +
      `Posted unsigned from CI because a kv write needs no signature; the signed confirmation follows in /r/lobby from the DID at /kv/did-${fp.slice(0, 2)}/${fp.slice(2)}. ` +
      `Method: https://github.com/Farukest/technocore-change-agent`,
  );

  console.log(`published to ${BASE}/kv/${NS}/${fp}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
