# Contributing

Eco Choices is a student project, so our workflow should stay clear and
lightweight while keeping `main` stable.

## Issues

- Search existing issues before opening a new one.
- Describe one problem or proposal per issue and provide enough context to
  reproduce or discuss it.
- Use the bug or feature template when it applies.
- Mark open questions as questions rather than assuming an architectural
  decision has been made.

## Branches

Create branches from the latest `main` and use a descriptive name:

- `feature/short-description`
- `fix/short-description`
- `docs/short-description`
- `chore/short-description`

Keep branches focused and avoid committing generated build output or
unnecessary large binaries.

## Commits

Use short, imperative commit messages, such as `Add transport scenario notes`
or `Fix documentation link`. Keep each commit understandable and related to
the branch's purpose.

## Pull requests

1. Open a pull request against `main` with a summary, related issue, and
   testing or validation notes.
2. Update documentation and tests when the change affects them.
3. Ask at least one teammate to review the pull request before merging.
4. Address review feedback or explain why it is not being addressed.
5. Merge only when the change is ready and checks pass.

Do not commit credentials, API keys, tokens, other secrets, generated build
files, or unnecessary large binaries. Keep `main` in a usable state so other
team members can work from it.
