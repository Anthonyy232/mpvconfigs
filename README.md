# mpvconfigs media

Sources for the [mpvconfigs](https://github.com/Anthonyy232/mpvconfigs) README hero (`.github/readme/hero-light.png` and `hero-dark.png` on `main`) and the repository's social preview.

## Rebuild

Needs Node and, for a new screenshot, [mpv](https://mpv.io/) on the `PATH` (or its path in `MPV`). From a checkout of `main`:

```bash
git worktree add ../mpvconfigs-media media
cd ../mpvconfigs-media
npm ci && npx playwright install chromium
node readme/capture.cjs ../mpvconfigs   # optional: new screenshot of mpv
node readme/build.cjs ../mpvconfigs
```

`build.cjs` writes the two heroes (2048x1216, 1280 CSS px at 1.6x, rounded card on transparency) into `../mpvconfigs/.github/readme/` and `readme/social-preview.png` (1280x640) here. Commit the heroes on `main` and the preview here; upload the preview by hand in the repository's Settings, General, Social preview (GitHub has no API for it). The build needs no network: the fonts and the screenshot are on this branch.

The key row under the headline is read from `input.conf` in the checkout at build time: every `seek` binding, grouped by modifier, keyboard before wheel, with its distance in seconds. Change the bindings and rebuild; nothing in the script needs editing.

## The screenshot

`readme/inputs/mpv-window.png` is a real mpv window running the config from the checkout. `capture.cjs`:

1. Encodes a 9:40 demo clip with mpv from lavfi sources into a temporary folder: a still navy to plum gradient, silent audio, a subtitle file and four chapters (Opening, Middle, Turn, Ending). Nothing is downloaded and no media is committed.
2. Starts mpv with `--config-dir` pointed at the checkout, a 1472x828 window, paused at 3:12 and titled "Demo clip", with ModernZ forced visible. It also turns off watch-later saving and shader caches so the checkout stays clean.
3. Waits over the JSON IPC pipe for the seek to land, takes `screenshot-to-file ... window` (video plus ModernZ, at window size), quits mpv and deletes the temporary folder.

A window opens on screen for a few seconds while it runs. Tested on Windows with mpv 0.41; elsewhere it talks to mpv over a Unix socket instead of a named pipe. The window is set always on top, so ModernZ's pin button shows as on.

## Layout

- `readme/build.cjs`: draws the hero and social preview in Chromium around the screenshot.
- `readme/capture.cjs`: makes the screenshot.
- `readme/inputs/`: the screenshot.
- `fonts/`: Instrument Serif regular and italic (latin subset), under the SIL Open Font License in `fonts/OFL.txt`.
