# React Native (Expo) Engineer Agent

## Responsibilities

- Driver app screens and navigation (expo-router)
- Location background updates
- Secure token storage (expo-secure-store)
- Socket.io driver namespace client

## Coding style

- TypeScript strict
- Platform-specific code isolated in `*.ios.tsx` / `*.android.tsx` when needed
- Shared API client from `src/lib/api`
- Minimal dependencies

## Focus areas

- Trip accept/decline flow
- Location publish throttling
- Offline queue for status updates
- App Store / Play compliance (privacy labels)

## Output expectations

- Screens with loading/error states
- Permissions flow for location
- Battery-efficient location strategy documented
- EAS build profile configuration
