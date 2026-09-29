const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Expo 템플릿은 release도 debug 키로 서명한다. 원스토어는 서명을 대신 관리해 주지 않아
 * 우리 업로드 키로 서명해야 하고, 한 번 올린 뒤 키가 바뀌면 업데이트를 올릴 수 없다.
 * `android/`는 prebuild마다 새로 만들어지므로(gitignore) 직접 고치지 않고 이 플러그인으로 넣는다.
 *
 * 키 경로·비밀번호는 레포가 아니라 `~/.gradle/gradle.properties`에 둔다(아래 TIKITAKA_UPLOAD_*).
 */
const SIGNING_CONFIG = `
        release {
            if (findProperty('TIKITAKA_UPLOAD_STORE_FILE')) {
                storeFile file(findProperty('TIKITAKA_UPLOAD_STORE_FILE'))
                storePassword findProperty('TIKITAKA_UPLOAD_STORE_PASSWORD')
                keyAlias findProperty('TIKITAKA_UPLOAD_KEY_ALIAS')
                keyPassword findProperty('TIKITAKA_UPLOAD_KEY_PASSWORD')
            }
        }`;

// 키가 없을 때 debug 키로 조용히 서명되면 그 APK가 그대로 스토어에 올라갈 수 있어, release 빌드만 막는다.
const MISSING_KEY_GUARD = `
gradle.taskGraph.whenReady { graph ->
    def isRelease = graph.allTasks.any { it.name ==~ /(assemble|bundle|package)Release/ }
    if (isRelease && !findProperty('TIKITAKA_UPLOAD_STORE_FILE')) {
        throw new GradleException('업로드 키가 없습니다. ~/.gradle/gradle.properties 에 TIKITAKA_UPLOAD_* 값을 설정하세요.')
    }
}
`;

function applyReleaseSigning(buildGradle) {
  if (buildGradle.includes('TIKITAKA_UPLOAD_STORE_FILE')) return buildGradle;

  const withSigningConfig = buildGradle.replace(
    /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/,
    `$1${SIGNING_CONFIG}`,
  );
  const withReleaseBuildType = withSigningConfig.replace(
    /(release\s*\{[^{}]*?)signingConfig signingConfigs\.debug/,
    '$1signingConfig signingConfigs.release',
  );

  // 템플릿이 바뀌어 치환이 안 되면 debug 서명 그대로 빌드되므로 prebuild 단계에서 멈춘다.
  if (withReleaseBuildType === withSigningConfig || withSigningConfig === buildGradle) {
    throw new Error(
      'withReleaseSigning: android/app/build.gradle 구조가 바뀌어 서명 설정을 넣지 못했습니다.',
    );
  }

  return withReleaseBuildType + MISSING_KEY_GUARD;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = applyReleaseSigning(mod.modResults.contents);
    return mod;
  });
};
