# Prototype Spacegame
This project is aimed to be a multiplayer dogfight spacegame in the browser where players share a unique/instanced* space

*will depend on server capacity and my own

# Structure
/gameServer.js 
- not accessible to players directly
- starts the server simulation
- handles websocket connections

/public
  /threeApp.js
  - renders game
  /game.js
  - starting point for other modules

# Objectives
This game isn't a commercial project, it's a prototype made from scratch to try and tackle the issue of multiplayer netcode.

The current architecture is **Server authoritative** :
- Clients send inputs
- Server simulates inputs
- Server sends global STATE
- Clients apply resulting state

What I want to achieve :
- Time travel (for **Rollback**-ish netcode)
- Encoding<->Decoding packets
- Scalable solution for persistance
- Maybe using something other than websockets

## Remarks & Notes
This project is currently a single repository, but it should probably be at least two in my opinion.
Which would be the client/server division and maybe some other microservices for leaderboards, messaging, etc...
