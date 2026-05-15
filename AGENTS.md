# WeekFlow Agent Instructions

## Project Overview

WeekFlow is a personal gamified productivity app.

The main product flow is:

1. Brain Dump
2. Week Kickoff
3. Backlog
4. Focus Mode
5. Day Summary

The core workflow rule is that the user can select up to 3 tasks per day, then focus on one selected task at a time until completion.

Gamification concepts include XP, streaks, levels, perfect days, carry over, and a simple Pomodoro timer.

## Current Project Goal

The app is currently being prepared for personal usage for 1 week.

The goal is to validate whether this workflow improves the user's productivity before expanding the product.

Do not implement these yet:

- Authentication
- Backend services
- External database
- Login or signup
- Public production deployment
- Multi-user support

## Stack and Architecture

- React + TypeScript
- Vite
- Tailwind CSS
- Global state is managed through `AppProvider`, `AppContext`, and `useAppStore`.
- Navigation is controlled by internal `screen` state, without React Router.
- Screen components live in `src/components/screens`.
- Reusable UI components live in `src/components/ui`.
- Layout components live in `src/components/layout`.
- Utilities live in `src/utils`.
- Shared types live in `src/types`.

Important state flow:

- `src/main.tsx` wraps the app with `AppProvider`.
- `src/store/AppContext.tsx` exposes the store through React context.
- `src/store/useAppStore.ts` owns app state, actions, derived selectors, and persistence coordination.
- `src/App.tsx` renders the active screen based on `state.screen`.
- Screens consume global state and actions through `useApp()`.

## Development Rules

- Do not change business rules unless necessary for the requested task.
- Prefer small, isolated changes.
- Avoid rewriting entire components.
- Preserve the existing visual design, interaction feel, and animations.
- Do not add dependencies without clear justification.
- Preserve strong TypeScript typing.
- Avoid `any`.
- Keep mutations predictable and React-safe; do not directly mutate nested state objects.
- Do not mix persistence logic into visual components.
- Centralize persistence in the store or in a dedicated utility.
- Keep visual components focused on rendering and user interaction.
- Keep business logic in the store, utilities, or focused hooks.
- Respect existing file organization and naming conventions.

## Product Rules

- The app must continue working locally and offline.
- Initial persistence should be local using `localStorage`.
- The user must be able to close or refresh the browser tab without losing the current week.
- Resetting data must be explicit and safe.
- The app must tolerate old, missing, or corrupted saved data.
- Avoid destructive data actions unless the user clearly requested them.
- Do not introduce public-account assumptions while the app is still personal-use only.

## Current Priority

The current engineering priority is:

1. Implement versioned local state persistence.
2. Validate the app personally for 1 week.
3. Only after validation, consider authentication, database storage, public deployment, and multi-user support.

For persistence work, prefer a versioned saved-state shape that can be validated, migrated, or safely ignored when corrupted.

## Expected Agent Response Format

Before modifying files:

- Explain the plan briefly.
- Identify likely files to change.
- Call out risks or assumptions when relevant.

After modifying files:

- List changed files.
- Summarize the behavior changed.
- Explain how to test manually.
- Mention any automated checks run.
- If checks could not be run, say why.

Do not invent features outside the current scope.

