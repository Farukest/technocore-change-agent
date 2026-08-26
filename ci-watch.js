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
  console.log(`CHANGE: ${headline}`);

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
