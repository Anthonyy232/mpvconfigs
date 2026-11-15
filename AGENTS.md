# Working on mpvconfigs

The owner's mpv configuration for Windows: `mpv.conf`, `input.conf` and the ModernZ on-screen controller. Users copy the files into mpv's config folder; there is nothing to build.

## Code

- Simple and direct. No speculative abstractions, options or extension points.
- Stay in scope; suggest extras instead of adding them.
- Use what the platform, framework, dependencies and this repo already provide before writing a helper.
- Validate only at real boundaries (user input, storage, network, other processes). No checks, fallbacks or try/catch for cases that can't happen.
- One source of truth for each value or rule.
- Delete dead code you find or create.
- Match the surrounding code.
- Fix root causes, and fix the same pattern everywhere it occurs.

## Comments

- Only where the reason isn't clear from the code: a quirk, a race, a non-obvious decision.
- Short fragments, not sentences. Never restate code, narrate, or label sections.
- Delete comments that no longer match.

## mpvconfigs

- `scripts/modernz.lua` and `fonts/modernz-icons.ttf` are upstream ModernZ files, kept byte for byte from a ModernZ release; update them together from a release, never edit them. `script-opts/modernz.conf` is ModernZ's sample options with as few changes as possible.
- Third-party files keep their own licences; the README's third-party table and `LICENSES/` must match what is in the tree. Only `mpv.conf` and `input.conf` are GPL-3.0.
- No personal paths, user names or machine-specific values: use mpv's path prefixes such as `~~desktop/`.
- Settings that differ by machine (GPU API, folders) go in the README's "Make it yours" list.

## Done means

- Diff reviewed against this file.
- `mpv --config-dir=. --keep-open=no --vo=null --ao=null --frames=1 av://lavfi:testsrc` loads the config with zero warnings.
- UI changes seen in the running app. Docs and metadata changes need no end-to-end run.
- README updated for anything users will notice; behaviour changes called out.

## Docs

- README is for users: what it does, how to get it, how to use it. No internals, no agent instructions.
- This file is for agents: only what can't be found quickly in the code.
- No meta docs in the repo (notes, audits, plans, reports).
- The README hero and social preview are built from the `media` branch; its README has the steps.

## Git

- `type: summary` or `type(scope): summary`: lowercase, imperative, no full stop, about 70 characters at most. Types: `feat` `fix` `refactor` `perf` `test` `docs` `style` `build` `ci` `chore`.
- Body only to say why. `Fixes #123` closes an issue.
- One logical change per commit. Squash fix-ups before merging.
- Branch off `main`. A single commit fast-forwards; several merge with `merge: <summary>`.
- No AI attribution in commits, branches, PRs or releases.
- One maintainer: amending and force-pushing to tidy history is fine. Keep contributors as authors. Delete stale branches.

## Pull requests

- Title in commit format. Body: what changed, why, how it was checked. Short.

## Releases

- None: the default branch is the configuration.

## Agents

- Pushing, amending and force-pushing are allowed. Ask before publishing a release or submitting to a store.
- Leave changes you didn't make alone. Clean up scratch files, processes and emulators.
- Say what was checked and how, and what wasn't.
- Short replies; one recommendation, not a list of options.
