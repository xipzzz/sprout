import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';

function which(cmd) {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-c', `command -v ${cmd}`], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d;
    });
    child.on('close', (code) => resolve(code === 0 ? out.trim() : ''));
  });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const err = [];
    child.stderr.on('data', (d) => err.push(d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed: ${Buffer.concat(err).toString()}`));
    });
  });
}

export async function speakToWav(text, wavPath) {
  const piper = await which('piper');
  const piperModel = process.env.PIPER_MODEL || '';
  if (piper && piperModel) {
    try {
      await access(piperModel, constants.R_OK);
      await new Promise((resolve, reject) => {
        const child = spawn(piper, ['--model', piperModel, '--output_file', wavPath], {
          stdio: ['pipe', 'ignore', 'pipe'],
        });
        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve() : reject(new Error('piper failed'))));
        child.stdin.end(text);
      });
      return 'piper';
    } catch {
      /* fall through */
    }
  }
  const espeakNg = await which('espeak-ng');
  if (espeakNg) {
    await run(espeakNg, ['-v', 'en-us', '-s', '145', '-w', wavPath, text]);
    return 'espeak-ng';
  }
  const espeak = await which('espeak');
  if (espeak) {
    await run(espeak, ['-v', 'en', '-s', '145', '-w', wavPath, text]);
    return 'espeak';
  }
  throw new Error('No local TTS. Install espeak-ng (Linux/Mac brew) or piper with PIPER_MODEL.');
}
