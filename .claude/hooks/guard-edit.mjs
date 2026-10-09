// PreToolUse(Edit|MultiEdit|Write): 절대 어기면 안 되는 파일 규칙을 막는다.
// 편집을 적용한 "결과 파일"을 만들어 검사하므로, 기존에 있던 내용은 문제 삼지 않는다.
// exit 2 = 차단, stderr가 Claude에게 사유로 전달된다. 스크립트 오류는 exit 1로 끝나 차단하지 않는다(fail-open).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const { tool_name: tool, tool_input: args = {} } = input;
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd;
const filePath = path.resolve(projectDir, args.file_path ?? '');
const rel = path.relative(projectDir, filePath).split(path.sep).join('/');

function block(reason) {
  process.stderr.write(reason);
  process.exit(2);
}

if (rel === '.npmrc') {
  block(
    '.npmrc는 수정·삭제할 수 없습니다. `node-linker=hoisted`가 빠지면 네이티브 오토링크가 깨집니다.',
  );
}
if (rel === 'src/constants/character/partMeta.ts') {
  block(
    'partMeta.ts는 자동 생성 파일입니다. 직접 수정하지 말고 `pnpm generate:part-meta`로 재생성하세요.',
  );
}

const before = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';

function applyEdit(text, { old_string: oldStr, new_string: newStr, replace_all: all }) {
  if (oldStr === undefined || !text.includes(oldStr)) return null;
  return all ? text.split(oldStr).join(newStr) : text.replace(oldStr, () => newStr);
}

let after = null;
if (tool === 'Write') after = args.content ?? '';
if (tool === 'Edit') after = applyEdit(before, args);
if (tool === 'MultiEdit') {
  after = before;
  for (const edit of args.edits ?? []) {
    after = after === null ? null : applyEdit(after, edit);
  }
}
// 적용할 수 없는 편집은 도구가 스스로 실패하므로 여기서는 통과시킨다.
if (after === null) process.exit(0);

if (rel === 'eas.json') {
  // 편집 전에 `EXPO_USE_PNPM`이 있던 빌드 프로필마다 값이 그대로인지 비교한다.
  const pnpmByProfile = (text) => {
    const { build = {} } = JSON.parse(text);
    return Object.fromEntries(
      Object.entries(build).map(([name, profile]) => [name, profile?.env?.EXPO_USE_PNPM]),
    );
  };
  let changed;
  try {
    const prev = pnpmByProfile(before);
    const next = pnpmByProfile(after);
    changed = Object.keys(prev).some(
      (name) => prev[name] !== undefined && next[name] !== prev[name],
    );
  } catch {
    // JSON이 깨진 중간 상태면 전체 개수로만 비교한다.
    const count = (text) => (text.match(/"EXPO_USE_PNPM"\s*:\s*"1"/g) ?? []).length;
    changed = count(after) < count(before);
  }
  if (changed) {
    block(
      'eas.json 빌드 프로필의 `EXPO_USE_PNPM=1`은 제거할 수 없습니다. EAS 빌드가 pnpm으로 설치해야 합니다.',
    );
  }
}

if (rel === 'app.json') {
  try {
    const pick = (text) => {
      const { expo = {} } = JSON.parse(text);
      return JSON.stringify([expo.ios?.buildNumber, expo.android?.versionCode]);
    };
    if (before && pick(after) !== pick(before)) {
      block(
        'app.json의 `ios.buildNumber`/`android.versionCode`는 EAS가 원격으로 관리합니다(`appVersionSource: remote`). ' +
          '앱 버전은 `version`만 올리세요.',
      );
    }
  } catch {
    // JSON이 깨진 중간 상태는 다른 도구가 잡는다.
  }
}

if (/^src\/(app|components)\/.+\.[jt]sx?$/.test(rel)) {
  const patterns = [
    /(?<![\w-])-?(?:p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|rounded(?:-(?:[tblrse]|tl|tr|bl|br|ss|se|es|ee))?|text|bg|leading|tracking)-\[[^\]\s]+\]/g,
    /(?<![\w-])(?:border(?:-[xytblrse])?|ring|outline|fill|stroke|shadow|divide|placeholder|decoration)-\[(?:#|rgba?\(|hsla?\()[^\]\s]*\]/g,
  ];
  const tally = (text) => {
    const counts = new Map();
    for (const re of patterns) {
      for (const [m] of text.matchAll(re)) counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return counts;
  };
  const prev = tally(before);
  const added = [...tally(after)]
    .filter(([cls, n]) => n > (prev.get(cls) ?? 0))
    .map(([cls]) => cls);
  if (added.length) {
    block(
      `간격·반경·색·폰트 크기에 임의값을 쓸 수 없습니다: ${added.join(', ')}\n` +
        'tailwind.config.js의 토큰(예: `px-lg`, `rounded-md`, `text-gray-800`, `text-sm`)을 쓰고, ' +
        '맞는 토큰이 없으면 tailwind.config.js에 먼저 추가하세요. 요소 크기(`w-[60px]`, `h-[...]`)는 허용됩니다.',
    );
  }
}
