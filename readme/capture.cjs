// node readme/capture.cjs <mpvconfigs checkout> : screenshot of mpv with this config on a generated demo clip -> readme/inputs/mpv-window.png
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const repo = process.argv[2];
if (!repo) throw new Error('usage: node readme/capture.cjs <path to a checkout of main>');
const mpv = process.env.MPV || 'mpv';
const out = path.join(__dirname, 'inputs', 'mpv-window.png');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mpvconfigs-capture-'));
const file = name => path.join(tmp, name);
const pipe = process.platform === 'win32' ? `\\\\.\\pipe\\mpvconfigs-capture-${process.pid}` : file('mpv.sock');
const [width, height] = [1472, 828];

// lavfi sources can't seek or report a duration, so encode 9:40 of them first.
// One still frame of a navy to plum gradient, looped; the last frame ends at 580 s.
// Drawn in BT.709 YUV, not RGB, so no conversion dither: smaller PNGs.
const t = 'clip(1.5*X/W+0.35*Y/H,0,1)';
const gradient = `nullsrc=s=${width}x${height}:r=1:d=1,format=yuv420p,geq=lum='55.78+18.75*${t}':cb='148.68-14.13*${t}':cr='127.82+39.14*${t}',loop=loop=-1:size=1,trim=duration=581`;
const encode = (source, ...args) => {
  if (spawnSync(mpv, ['--no-config', `av://lavfi:${source}`, ...args], { stdio: 'ignore' }).status !== 0) throw new Error(`encoding ${source} failed`);
};
encode(gradient, `--o=${file('demo.mkv')}`, '--ovc=libx264', '--ovcopts=preset=veryfast,crf=18');
// silent audio and an empty-looking subtitle so ModernZ shows its audio and subtitle buttons
encode('anullsrc=d=580', `--o=${file('demo.mka')}`, '--oac=aac');
fs.writeFileSync(file('demo.srt'), '1\n00:09:00,000 --> 00:09:01,000\n.\n');
const chapter = (start, end, title) => `[CHAPTER]\nTIMEBASE=1/1\nSTART=${start}\nEND=${end}\ntitle=${title}\n`;
fs.writeFileSync(file('chapters.txt'), `;FFMETADATA1\n${chapter(0, 120, 'Opening')}${chapter(120, 300, 'Middle')}${chapter(300, 480, 'Turn')}${chapter(480, 580, 'Ending')}`);

const player = spawn(mpv, [
  `--config-dir=${repo}`,
  file('demo.mkv'),
  `--audio-file=${file('demo.mka')}`, `--sub-file=${file('demo.srt')}`, '--sid=no',
  `--chapters-file=${file('chapters.txt')}`,
  '--force-media-title=Demo clip',
  '--start=192', '--pause',
  `--geometry=${width}x${height}`, '--hidpi-window-scale=no', '--ontop',
  // keep the checkout clean and the controls up for the shot
  '--save-position-on-quit=no', '--resume-playback=no', '--gpu-shader-cache=no', '--icc-cache=no',
  '--script-opts=modernz-visibility=always', '--screenshot-high-bit-depth=no',
  `--input-ipc-server=${pipe}`,
], { stdio: 'ignore' });

const connect = () => new Promise(resolve => {
  const retry = () => net.connect(pipe).once('connect', function () { resolve(this); }).once('error', () => setTimeout(retry, 100));
  retry();
});

(async () => {
  try {
    const socket = await connect();
    let id = 0;
    const waiting = new Map();
    const events = [];
    let buffer = '';
    socket.on('data', chunk => {
      buffer += chunk;
      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const msg = JSON.parse(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
        if (msg.request_id) waiting.get(msg.request_id)(msg);
        else if (msg.event) events.push(msg.event);
      }
    });
    const command = (...args) => new Promise((resolve, reject) => {
      waiting.set(++id, msg => (msg.error === 'success' ? resolve(msg.data) : reject(new Error(`${args[0]}: ${msg.error}`))));
      socket.write(JSON.stringify({ command: args, request_id: id }) + '\n');
    });
    const until = async test => { while (!(await test())) await new Promise(r => setTimeout(r, 100)); };

    await until(async () => events.includes('playback-restart'));
    await until(async () => Math.round(await command('get_property', 'time-pos')) === 192);
    // ModernZ draws on its own timer and fades in for 200 ms
    await new Promise(r => setTimeout(r, 1500));
    await command('screenshot-to-file', out, 'window');
    await command('quit');
  } catch (error) {
    player.kill();
    throw error;
  } finally {
    await new Promise(r => (player.exitCode !== null ? r() : player.once('exit', r)));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(path.relative(process.cwd(), out));
})();
