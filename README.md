# mpvconfigs

My personal Windows config for standalone mpv.

This setup is intentionally small: ModernZ for the OSC, current mpv `gpu-next`
rendering, 3 second seeks, and HDR-aware color signaling without forced HDR
or placebo tuning.

## Current Setup

- mpv: `v0.41.0-689-g9e06c3248`
- FFmpeg: `N-124616-g3baab604d`
- libplacebo: `v7.364.0`
- ModernZ: `v0.3.3`
- Last refreshed: May 2026

## Install

Copy the repository contents into:

```text
%APPDATA%\mpv
```

That usually expands to:

```text
C:\Users\<username>\AppData\Roaming\mpv
```

Expected layout:

```text
mpv/
├── fonts/
│   └── modernz-icons.ttf
├── script-opts/
│   └── modernz.conf
├── scripts/
│   └── modernz.lua
├── input.conf
└── mpv.conf
```

If a `portable_config` folder exists next to `mpv.exe`, mpv will prefer that
instead of `%APPDATA%\mpv`.

## Highlights

- Stock mpv OSC disabled in favor of ModernZ.
- `vo=gpu-next` with D3D11 for the Windows display path.
- `profile=high-quality` and `hwdec=auto-safe`.
- `target-colorspace-hint=auto` for mixed SDR/HDR use.
- Exact 3 second seeks on arrow keys and mouse wheel.
- Built-in mpv OSD bar disabled.
- ModernZ top and bottom bars show together on mouse movement.
- ModernZ buttons trimmed down: no fullscreen, loop, playlist/menu, volume,
  playlist next/previous, or jump buttons.

## Notes

Vulkan is not enabled by default. On Windows, D3D11 is the conservative choice
for mixed SDR/HDR playback because the color signaling path is reliable with
`target-colorspace-hint=auto`. Vulkan may still be worth testing if a specific
driver or display path has stutter or frame pacing issues.

Thumbfast is not bundled in this version. ModernZ supports it, but this config
keeps thumbnail preview support out until it is explicitly needed.

## Credits

- [mpv](https://mpv.io/)
- [ModernZ](https://github.com/Samillion/ModernZ)

The rights to the respective creators are acknowledged. Please refer to the
individual projects for license terms.
