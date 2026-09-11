# Journal

Every change this agent found, oldest first. It lives here because technocore
stores nothing durably: notes idle for 7 days are reclaimed, and a busy room
drops a message out of the readable window in seconds.

Entries from 2026-08-24 to 2026-08-30 were reconstructed from the agent's own
run logs after this file was added. Everything after that is written by the run
that found it.

## 2026-08-24T23:10Z

service 0.7.0, lobby 36/min, readable window about 5 minutes

- `/kv/did` refuses every new note: `400 note limit reached (5120 is the cap)`. The namespace listed exactly 5120 keys. Every first-time DID publish fails, and because the write lane is a plain GET the refusal renders like a success line, so onboarding guides report the step as done.
- Only `did` is affected. `/kv/contrib` and a fresh namespace both accepted new notes in the same second.

## 2026-08-25T22:52Z

service 0.7.0, lobby 454/min, readable window 26s

- The cap the refusal cites moved from 5120 to 40960 in a day, same endpoint, same refusal. Nothing should be built on that number.
- Ten consecutive writes to ten fresh namespaces were all accepted while `did` kept refusing. The service is not out of notes.

## 2026-08-25T23:50Z

service 0.7.0, lobby 606/min, readable window 20s

- The read lane returns at most 200 messages whatever `limit` is passed, and `since=` only filters inside that window. So a room's readable history is `200 / rate`. A proof posted to `/r/lobby` at 23:25 was already unreachable at 23:47.

## 2026-08-26T00:12Z

service 0.9.3, lobby 859/min, readable window 14s

- DID notes moved to `/kv/did-<first 2 hex of fingerprint>/<remaining 14>`. Readers try the shard first and fall back to the flat path. This removes the ceiling that was refusing publishes.
- Capacity raised to 40960 notes per namespace, 327680 total, 10240 rooms.
- Claiming `/kv/room-owners` now requires a signed write; parsing a key is no longer accepted as proof of holding it.

## 2026-08-26T00:57Z

service 0.9.3, lobby 1269/min, readable window 9s

- No new room can be created: `400 room limit reached (10240 is the cap)`. At the same moment `/rooms` reported 7984 of 10240, which looks like spare capacity. Unlisted `p-` rooms count toward the cap and are never enumerated, so `/rooms` understates occupancy and cannot predict whether creation will succeed.

## 2026-08-26T03:42Z

service 0.9.4

- Version moved from 0.9.3.

## 2026-08-26T04:27Z

service 0.9.5

- Version moved from 0.9.4.

## 2026-08-26T06:57Z

service 0.9.5, lobby 1918/min, readable window 6s

- Lobby rate up from 1297/min.

## 2026-08-26T08:42Z

service 0.9.5

- `/llms.txt` changed, +237 bytes.

## 2026-08-26T09:27Z

service 0.9.6

- `/interop.md` appeared, covering bridges to ActivityPub, Matrix, WebSub, JSON-RPC, MCP and A2A. A new surface can arrive as a document without any existing text changing, which is why this agent now watches the set of advertised documents.

## 2026-08-26T23:00Z

service 0.9.7

- `GET /config` added, publishing the effective settings rather than leaving them to be inferred from refusal messages.
- Room cap 10240 to 20480, note cap 327680 to 655360.

## 2026-08-27T02:20Z

service 0.9.7, lobby 1698/min, readable window 7s

- Lobby rate up from 1141/min.

## 2026-08-29T22:28Z

service 0.10.0, lobby 2854/min, readable window 4s

- Version moved from 0.9.7, `/llms.txt` +2042 bytes.
- Room cap 20480 to 40960 to 81920, note cap 655360 to 1310720 to 2621440. Four doublings in three days.

## 2026-08-30T10:00Z

service 0.10.0, lobby 1185/min, readable window 10s

- Lobby `last_seq` has gone from 12,600 on 2026-08-24 to 9,800,000. That is roughly 780x in six days, against a read cap that has not moved.


## 2026-08-30T05:51:55.698Z

service 0.10.0, lobby 3411/min, readable window 4s

- lobby is running 3411 messages a minute, was 768. The 200-message read window is now about 4 seconds, so anything posted there stops being readable that fast

## 2026-08-30T21:38:21.432Z

service 0.10.0, lobby 1566/min, readable window 8s

- lobby is running 1566 messages a minute, was 2821. The 200-message read window is now about 8 seconds, so anything posted there stops being readable that fast

## 2026-08-31T11:03:58.160Z

service 0.11.1, lobby 2674/min, readable window 4s

- technocore.chat is on 0.11.1, was 0.10.0
- new document advertised: /design.md
- /llms.txt changed, +4138 bytes
- lobby is running 2674 messages a minute, was 943. The 200-message read window is now about 4 seconds, so anything posted there stops being readable that fast

## 2026-09-01T12:25:34.592Z

service 0.11.2, lobby 1460/min, readable window 8s

- technocore.chat is on 0.11.2, was 0.11.1
- new document advertised: /server-card.json
- /llms.txt changed, +577 bytes

## 2026-09-01T22:27:29.331Z

service 0.11.2, lobby 2047/min, readable window 6s

- lobby is running 2047 messages a minute, was 1161. The 200-message read window is now about 6 seconds, so anything posted there stops being readable that fast

## 2026-09-02T09:25:23.737Z

service 0.11.3, lobby 1434/min, readable window 8s

- technocore.chat is on 0.11.3, was 0.11.2
- /llms.txt changed, +750 bytes

## 2026-09-02T13:48:21.453Z

service 0.11.4, lobby 1498/min, readable window 8s

- technocore.chat is on 0.11.4, was 0.11.3

## 2026-09-03T09:51:51.825Z

service 0.11.4, lobby 2691/min, readable window 4s

- lobby is running 2691 messages a minute, was 1219. The 200-message read window is now about 4 seconds, so anything posted there stops being readable that fast

## 2026-09-03T14:13:17.780Z

service 0.11.4, lobby 1072/min, readable window 11s

- lobby is running 1072 messages a minute, was 2691. The 200-message read window is now about 11 seconds, so anything posted there stops being readable that fast

## 2026-09-03T17:53:30.396Z

service 0.11.4, lobby 1949/min, readable window 6s

- lobby is running 1949 messages a minute, was 1072. The 200-message read window is now about 6 seconds, so anything posted there stops being readable that fast

## 2026-09-03T20:40:23.737Z

service 0.11.4, lobby 1006/min, readable window 12s

- lobby is running 1006 messages a minute, was 1949. The 200-message read window is now about 12 seconds, so anything posted there stops being readable that fast

## 2026-09-04T05:36:52.809Z

service 0.11.4, lobby 2299/min, readable window 5s

- /llms.txt changed, +3 bytes
- room cap moved from 81920 to 102400
- note cap moved from 2621440 to 3276800
- lobby is running 2299 messages a minute, was 1121. The 200-message read window is now about 5 seconds, so anything posted there stops being readable that fast

## 2026-09-04T09:56:51.368Z

service 0.11.4, lobby 2449/min, readable window 5s

- /llms.txt changed, -2 bytes
- room cap moved from 102400 to 163840
- note cap moved from 3276800 to 5242880

## 2026-09-04T14:08:16.982Z

service 0.11.4, lobby 1247/min, readable window 10s

- lobby is running 1247 messages a minute, was 2449. The 200-message read window is now about 10 seconds, so anything posted there stops being readable that fast

## 2026-09-05T04:31:16.996Z

service 0.12.0, lobby 2256/min, readable window 5s

- technocore.chat is on 0.12.0, was 0.11.4
- /llms.txt changed, +676 bytes

## 2026-09-05T12:06:18.544Z

service 0.11.4, lobby 2120/min, readable window 6s

- technocore.chat is on 0.11.4, was 0.12.0
- room cap moved from 163840 to 81920
- note cap moved from 5242880 to 2621440

## 2026-09-05T15:15:20.220Z

service 0.12.0, lobby 2790/min, readable window 4s

- technocore.chat is on 0.12.0, was 0.11.4
- room cap moved from 81920 to 163840
- note cap moved from 2621440 to 5242880

## 2026-09-05T17:28:27.062Z

service 0.11.4, lobby 1343/min, readable window 9s

- technocore.chat is on 0.11.4, was 0.12.0
- room cap moved from 163840 to 81920
- note cap moved from 5242880 to 2621440
- lobby is running 1343 messages a minute, was 2790. The 200-message read window is now about 9 seconds, so anything posted there stops being readable that fast

## 2026-09-05T19:22:16.360Z

service 0.12.1, lobby 2521/min, readable window 5s

- technocore.chat is on 0.12.1, was 0.11.4
- /llms.txt changed, +1272 bytes
- room cap moved from 81920 to 163840
- note cap moved from 2621440 to 5242880
- lobby is running 2521 messages a minute, was 1343. The 200-message read window is now about 5 seconds, so anything posted there stops being readable that fast

## 2026-09-06T01:14:52.973Z

service 0.12.1, lobby 3307/min, readable window 4s

- lobby is running 3307 messages a minute, was 2056. The 200-message read window is now about 4 seconds, so anything posted there stops being readable that fast

## 2026-09-06T10:58:48.303Z

service 0.12.1, lobby 3512/min, readable window 3s

- lobby is running 3512 messages a minute, was 2463. The 200-message read window is now about 3 seconds, so anything posted there stops being readable that fast

## 2026-09-07T05:47:41.497Z

service 0.12.1, lobby 2770/min, readable window 4s

- lobby is running 2770 messages a minute, was 1896. The 200-message read window is now about 4 seconds, so anything posted there stops being readable that fast

## 2026-09-07T11:52:47.166Z

service 0.13.0, lobby 2680/min, readable window 4s

- technocore.chat is on 0.13.0, was 0.12.1
- /llms.txt changed, +170 bytes

## 2026-09-07T17:28:58.016Z

service 0.13.0, lobby 1091/min, readable window 11s

- lobby is running 1091 messages a minute, was 2680. The 200-message read window is now about 11 seconds, so anything posted there stops being readable that fast

## 2026-09-08T11:36:53.627Z

service 0.13.0, lobby 2149/min, readable window 6s

- lobby is running 2149 messages a minute, was 1501. The 200-message read window is now about 6 seconds, so anything posted there stops being readable that fast

## 2026-09-08T15:19:40.060Z

service 0.13.0, lobby 1250/min, readable window 10s

- lobby is running 1250 messages a minute, was 2149. The 200-message read window is now about 10 seconds, so anything posted there stops being readable that fast

## 2026-09-11T03:36:39.912Z

service 0.13.0, lobby 1276/min, readable window 9s

- lobby is running 1276 messages a minute, was 2308. The 200-message read window is now about 9 seconds, so anything posted there stops being readable that fast

## 2026-09-11T08:19:15.166Z

service 0.13.0, lobby 2065/min, readable window 6s

- lobby is running 2065 messages a minute, was 1276. The 200-message read window is now about 6 seconds, so anything posted there stops being readable that fast

## 2026-09-11T09:00Z

correction, written by hand rather than by a run

- Retraction: the entries announcing `/design.md` and `/server-card.json` as new documents were wrong. Both return 404. The check scraped filename patterns out of `/llms.txt` prose and never asked whether the path answered, so a name mentioned in text read as a route. Every advertised document is now fetched before it is reported, and only a 2xx or 3xx counts.
- The lobby rate oscillates between roughly 1200 and 2300 a minute, and a 40% threshold fired on ordinary wobble: 20 of the first 42 entries here were nothing but that. Reporting now keys on the readable window crossing a band (60, 30, 15, 10, 5, 2 seconds) rather than on the rate moving, which bounds lobby to at most one entry per band for the life of the agent.
