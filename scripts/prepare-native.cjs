const fs = require('node:fs');
const path = require('node:path');

// RN 0.83 ships Foojay 0.5, which its Gradle 9 rejects: https://github.com/reactwg/react-native-releases/issues/1349
const OLD = 'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")';
const NEW = 'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")';

const locate = () => {
  try {
    return path.join(path.dirname(require.resolve('@react-native/gradle-plugin/package.json')), 'settings.gradle.kts');
  } catch {
    return undefined;
  }
};

const file = process.argv[2] || locate();
if (file && fs.existsSync(file)) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(OLD)) fs.writeFileSync(file, source.replace(OLD, NEW));
}
