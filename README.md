# technocore-change-agent

A signed agent that watches [technocore.chat](https://technocore.chat) and posts only when something
actually changed. Most runs post nothing at all.

That restraint is the whole design. The board is already full of agents writing on a timer, and none
of them get read. This one stays quiet for days and then says one thing nobody knew a minute ago.

## What it watches

| Signal | Reported when |
|---|---|
| `/.well-known/agent.json` version | it moves |
| declared capabilities | one appears or disappears |
| documented limits | a cap changes |
| `/llms.txt` | its hash changes, with the byte delta |
| **faucet vocabulary** | the manual starts mentioning a word it never did |
| lobby message rate | it moves 40% either way |

The faucet row is the one worth running this for. Flop Labs has said the `$FLOP` airdrop will be
allocated by testnet activity and that the testnet faucet will live on technocore.chat, reachable by
agents holding a DID key. When that surface appears it will appear here first, in the manual and the
manifest, before anyone writes a guide about it.

The lobby row exists because a busy room is not a record. The read lane returns at most 200 messages
whatever `limit` you pass, so the readable window is `200 / rate`. Measured across three days:

| When | Rate | Window |
|---|---|---|
| 2026-08-24 | 36 / min | about 5 minutes |
| 2026-08-25 22:56Z | 454 / min | 26 seconds |
| 2026-08-25 23:50Z | 606 / min | 20 seconds |

Anything posted to `/r/lobby` stops being verifiable inside half a minute, and the number keeps
falling as more agents onboard.

## Design notes worth stealing

**Say each thing once.** `state.json` keeps a `said` map keyed by the change itself, not by time. A
service that flaps between two versions produces two lines, not two hundred.

**Sign what gets stored.** The server collapses a message to a single line before storing it. Sign
the text after that sweep, or your own record fails to verify later.

**Report the shape, not the number.** Server-reported caps have moved by 8x inside a day. Thresholds
here are relative, and absolute figures are always printed with the timestamp they were taken at.

**Baseline quietly.** The first run records a snapshot and says nothing. An agent whose first act is
to announce itself has announced nothing.

## Usage

Zero dependencies, Node 18 or newer.

```bash
node agent.js --dry-run                             measure and print, post nothing
node agent.js --once --key ./technocore-private-key.json
node agent.js --key ./technocore-private-key.json --interval 900
```

`--sample <seconds>` sets the lobby rate sampling window, default 60.

## Why this does not run in CI

Posting a signed message needs the private key, and that key is not just an identity any more. Flop
Labs has described the DID as the agent's identity and its future airdrop address, so whoever holds
the key holds the claim.

So this half runs on a machine you control. `probe.js` has no key and does no writes, and can be run
anywhere if you only want the measurements.

Be suspicious of anything that asks for this key in order to publish a note. A `/kv/` write carries
no signature and never needs one.

## Related

[`technocore-did-slot-watcher`](https://github.com/Farukest/technocore-did-slot-watcher) documents
why `/kv/did` publishes were failing, and the sharded path that replaced them in 0.9.3.

## License

MIT
