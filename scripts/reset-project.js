#!/usr/bin/env node

// Expo 템플릿 기본 스크립트: /src, /scripts를 /example로 옮기거나 삭제하고 빈 /src/app을 만든다.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = process.cwd();
const oldDirs = ['src', 'scripts'];
const exampleDir = 'example';
const newAppDir = 'src/app';
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === 'y') {
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === 'y') {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log('\n📁 New /src/app directory created.');

    const indexPath = path.join(newAppDirPath, 'index.tsx');
    await fs.promises.writeFile(indexPath, indexContent);
    console.log('📄 src/app/index.tsx created.');

    const layoutPath = path.join(newAppDirPath, '_layout.tsx');
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log('📄 src/app/_layout.tsx created.');

    console.log('\n✅ Project reset complete. Next steps:');
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/app/index.tsx to edit the main screen.\n3. Put all your application code in /src, only screens and layout files should be in /src/app.${
        userInput === 'y'
          ? `\n4. Delete the /${exampleDir} directory when you're done referencing it.`
          : ''
      }`,
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  'Do you want to move existing files to /example instead of deleting them? (Y/n): ',
  (answer) => {
    const userInput = answer.trim().toLowerCase() || 'y';
    if (userInput === 'y' || userInput === 'n') {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  },
);
