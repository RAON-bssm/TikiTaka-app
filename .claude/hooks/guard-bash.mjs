// PreToolUse(Bash): pnpm 외 패키지 매니저 사용과 .npmrc 변경을 막는다.
// exit 2 = 차단, stderr가 Claude에게 사유로 전달된다. 스크립트 오류는 exit 1로 끝나 차단하지 않는다(fail-open).
import { readFileSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = input.tool_input?.command ?? '';

// 조회만 하는 npm 명령(npm view 등)은 프로젝트 의존성을 건드리지 않아 허용한다.
const NPM_WRITE_SUBCOMMANDS = new Set([
  'install',
  'i',
  'add',
  'ci',
  'uninstall',
  'remove',
  'rm',
  'un',
  'update',
  'up',
  'upgrade',
  'run',
  'run-script',
  'exec',
  'x',
  'init',
  'create',
  'link',
  'dedupe',
  'prune',
  'rebuild',
  'start',
  'test',
]);
// 값을 따로 받는 npm 전역 옵션. `npm --prefix . install`처럼 서브커맨드 앞에 오면 값까지 건너뛴다.
const NPM_VALUE_OPTIONS = new Set([
  '--prefix',
  '-C',
  '--registry',
  '--cache',
  '--userconfig',
  '--globalconfig',
  '--workspace',
  '-w',
  '--loglevel',
  '--location',
  '--tag',
  '--omit',
  '--include',
]);
const ALWAYS_BLOCKED = new Set(['yarn', 'bun', 'bunx', 'npx']);

function npmSubcommand(args) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('-')) return args[i];
    if (NPM_VALUE_OPTIONS.has(args[i])) i++;
  }
}

function block(reason) {
  process.stderr.write(reason);
  process.exit(2);
}

const segments = command.split(/&&|\|\||;|\||\n|\$\(|`|\(|\)/);
for (const raw of segments) {
  const words = raw.trim().split(/\s+/).filter(Boolean);
  while (
    words.length &&
    (/^\w+=/.test(words[0]) || ['sudo', 'command', 'exec', 'env'].includes(words[0]))
  ) {
    words.shift();
  }
  if (!words.length) continue;
  const bin = path.basename(words[0]);
  if (
    ALWAYS_BLOCKED.has(bin) ||
    (bin === 'npm' && NPM_WRITE_SUBCOMMANDS.has(npmSubcommand(words.slice(1))))
  ) {
    block(
      `이 프로젝트는 pnpm만 사용합니다. \`${bin}\` 대신 pnpm을 쓰세요 ` +
        '(설치: `pnpm expo install <패키지>`, 스크립트: `pnpm <script>`, 일회성 실행: `pnpm dlx`/`pnpm exec`).',
    );
  }
}

if (
  /\.npmrc/.test(command) &&
  /(>|\brm\b|\bmv\b|\bcp\b|\btee\b|\btruncate\b|\bsed\b[^|;&]*\s-i)/.test(command)
) {
  block(
    '.npmrc는 수정·삭제할 수 없습니다. `node-linker=hoisted`가 빠지면 네이티브 오토링크가 깨집니다.',
  );
}
