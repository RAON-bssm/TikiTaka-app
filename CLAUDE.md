@AGENTS.md

## Claude Code 전용

- `.claude/rules/`는 자동으로 로드됩니다. 공통 규칙은 항상, 도메인 규칙은 해당 경로 파일을 다룰 때 읽히므로 위 표의 파일을 따로 열 필요가 없습니다.
- `.claude/hooks/`가 "절대 어기면 안 되는 규칙"을 도구 호출 단계에서 차단합니다. 차단되면 사유를 읽고 규칙에 맞게 바꾸세요. 우회하지 마세요.
- 스킬: `add-character-part`, `release`
- 에이전트(출력이 큰 작업): `verifier`(타입체크·린트 요약), `expo-docs-researcher`(Expo v56 문서 조사), `character-asset-auditor`(파츠 에셋 정합성 점검)
