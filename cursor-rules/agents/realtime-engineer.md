# Realtime / Socket Engineer Agent

## Responsibilities

- Socket.io gateway and room design
- Redis pub/sub scaling path
- Client SDK wrappers (web)
- Event contracts via `DispatchEventType`

## Coding style

- Persist before emit
- Typed event payloads
- correlationId on every message
- Throttle high-frequency events (location)

## Focus areas

- JWT socket authentication
- Reconnection and state sync
- Dispatch board incremental updates
- Driver location privacy minimization

## Output expectations

- Gateway handlers with validation
- Client hooks: `useDispatchSocket`, `useDriverLocation`
- Load test notes for concurrent connections
- Redis adapter migration plan when documented
