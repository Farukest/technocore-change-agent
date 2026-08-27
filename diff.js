"use strict";

// Turns two snapshots into the sentences worth saying, and nothing else.
// If this returns an empty array the agent stays quiet, which is most of the time.

const LOBBY_STEP = 0.4; // report a rate move only once it is 40% either way

function pct(a, b) {
  if (!a) return Infinity;
  return Math.abs(b - a) / a;
}

function changes(prev, next) {
  const out = [];

  if (!prev) {
    out.push({
      key: "first-run",
      quiet: true,
      text: `baseline recorded at ${next.version || "unknown version"}`,
    });
    return out;
  }

  if (prev.version !== next.version) {
    out.push({
      key: `version:${next.version}`,
      text: `technocore.chat is on ${next.version}, was ${prev.version}`,
    });
  }

  const gained = next.capabilities.filter((c) => !prev.capabilities.includes(c));
  const lost = prev.capabilities.filter((c) => !next.capabilities.includes(c));
  if (gained.length) out.push({ key: `cap+:${gained.join(",")}`, text: `new capability: ${gained.join(", ")}` });
  if (lost.length) out.push({ key: `cap-:${lost.join(",")}`, text: `capability removed: ${lost.join(", ")}` });

  // The one worth waking up for.
  const newWords = next.faucet.filter((w) => !prev.faucet.includes(w));
  if (newWords.length) {
    out.push({
      key: `faucet:${newWords.join(",")}`,
      text: `the manual now mentions ${newWords.join(", ")}, which it did not before. Read /llms.txt and /.well-known/agent.json`,
    });
  }

  // A path that answers is the loudest signal this agent can carry, so it has to
  // survive two consecutive rounds before it is worth saying. One round of 503s
  // from a busy origin already cost eight false alarms.
  const confirmed = prev.livePaths
    ? next.livePaths.filter((path) => prev.livePaths.includes(path))
    : [];
  for (const path of confirmed) {
    out.push({
      key: `live:${path}`,
      text: `the path ${path} is answering, and was 404 until recently. Flop Labs has said the testnet faucet will live on this host and be reachable by agents holding a DID key`,
    });
  }

  const newDocs = prev.docs ? next.docs.filter((d) => !prev.docs.includes(d)) : [];
  if (newDocs.length) {
    out.push({ key: `docs:${newDocs.join(",")}`, text: `new document advertised: ${newDocs.join(", ")}` });
  }
  if (prev.llmsHash !== next.llmsHash) {
    const delta = next.llmsBytes - prev.llmsBytes;
    out.push({
      key: `llms:${next.llmsHash}`,
      text: `/llms.txt changed, ${delta >= 0 ? "+" : ""}${delta} bytes`,
    });
  }

  for (const [field, label] of [["note_chars", "note size"], ["message_chars", "message size"], ["rooms", "room cap"], ["notes", "note cap"]]) {
    const a = prev.limits?.[field];
    const b = next.limits?.[field];
    if (a !== undefined && b !== undefined && a !== b) {
      out.push({ key: `limit:${field}:${b}`, text: `${label} moved from ${a} to ${b}` });
    }
  }

  if (prev.lobby && next.lobby && pct(prev.lobby.perMinute, next.lobby.perMinute) >= LOBBY_STEP) {
    out.push({
      key: `lobby:${Math.round(next.lobby.perMinute / 100)}`,
      text: `lobby is running ${next.lobby.perMinute} messages a minute, was ${prev.lobby.perMinute}. The 200-message read window is now about ${next.lobby.windowSeconds} seconds, so anything posted there stops being readable that fast`,
    });
  }

  return out;
}

module.exports = { changes };
