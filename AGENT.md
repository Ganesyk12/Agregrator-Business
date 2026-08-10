# AGENTS.md

# SIGYN Project

SIGYN is a vendor booking marketplace.

Always preserve the existing architecture and business logic.

## General Principles

- Think before coding.
- Never hallucinate or guess.
- Ask for clarification if required information is missing.
- Prefer the simplest solution.
- Make the smallest possible change.
- Reuse existing components, services, and utilities.
- Follow the existing coding style and project structure.

## Context Rules

- Repository context is expensive.
- Read only the files required for the current task.
- Never scan the entire repository unless explicitly requested.
- Stop searching once enough information is available.
- Avoid rereading files already inspected.

## Project Rules

- Preserve existing authentication flow.
- Preserve booking flow.
- Prefer backward-compatible changes.
- Never remove existing functionality unless explicitly requested.
- Never modify unrelated code.

## Database

- Never drop tables.
- Never delete migrations.
- Prefer additive schema changes.

## When Unsure

Do not assume.

Ask questions before implementing.
