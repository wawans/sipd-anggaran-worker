const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

// ANSI Color Codes for stylized CLI output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgCyan: '\x1b[46m\x1b[30m',
};

// Configuration state
const config = {
  headed: false,
  ui: false,
  debug: false,
  project: '', // e.g. 'chromium'
  customArgs: '',
};

const TESTS_DIR = path.join(__dirname, 'tests');

/**
 * Recursively gets all runnable files (.ts, .js, .spec.ts, etc.) in a directory.
 */
function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      if (
        /\.(spec|test)\.(ts|js)$/.test(file)
        // || /\.(ts|js)$/.test(file)
      ) {
        results.push(filePath);
      }
    }
  });

  return results;
}

/**
 * Normalizes file path to relative path with forward slashes for cross-platform play.
 */
function toRelativePath(absolutePath) {
  return path.relative(__dirname, absolutePath).replace(/\\/g, '/');
}

/**
 * Clears terminal screen.
 */
function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0;0H');
}

/**
 * Renders the top header banner.
 */
function renderHeader() {
  clearScreen();
  console.log(
    `${colors.cyan}${colors.bold}====================================================${colors.reset}`,
  );
  console.log(
    `${colors.cyan}${colors.bold}         SIPD Anggaran - Worker Runner Menu          ${colors.reset}`,
  );
  console.log(
    `${colors.cyan}${colors.bold}====================================================${colors.reset}`,
  );

  const status = [
    `Headed: ${config.headed ? colors.green + 'ON' : colors.dim + 'OFF'}`,
    `UI: ${config.ui ? colors.green + 'ON' : colors.dim + 'OFF'}`,
    `Debug: ${config.debug ? colors.green + 'ON' : colors.dim + 'OFF'}`,
    config.project ? `Project: ${colors.yellow + config.project}` : null,
  ]
    .filter(Boolean)
    .join(`${colors.reset} | `);

  console.log(
    `${colors.dim}Settings [ ${status}${colors.reset}${colors.dim} ]${colors.reset}\n`,
  );
}

/**
 * Executes a test command via child_process.spawn with inherited stdio.
 */
function runCommand(cmd, args, callback) {
  clearScreen();
  console.log(
    `${colors.bold}${colors.green}>>> Running: ${cmd} ${args.join(' ')}${colors.reset}\n`,
  );

  const child = spawn(cmd, args, { stdio: 'inherit', shell: true });

  child.on('close', (code) => {
    console.log(
      `\n${colors.bold}${code === 0 ? colors.green + '✔ Completed successfully!' : colors.red + '✘ Process exited with code ' + code}${colors.reset}\n`,
    );

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      `${colors.yellow}Press Enter to return to main menu...${colors.reset}`,
      () => {
        rl.close();
        callback();
      },
    );
  });
}

/**
 * Builds Playwright CLI arguments based on current configuration and target.
 */
function buildPlaywrightArgs(targetPath = '') {
  const args = ['playwright', 'test'];
  if (targetPath) {
    args.push(targetPath);
  }
  if (config.headed) args.push('--headed');
  if (config.ui) args.push('--ui');
  if (config.debug) args.push('--debug');
  if (config.project) args.push(`--project=${config.project}`);
  if (config.customArgs) {
    args.push(...config.customArgs.split(' ').filter(Boolean));
  }
  return args;
}

/**
 * Interactive Selection Menu (Supports Arrow Keys & Number Input)
 */
function showMenu(title, choices, onSelect) {
  let selectedIndex = 0;
  const isTTY = process.stdin.isTTY;

  function render() {
    renderHeader();
    if (title) console.log(`${colors.bold}${title}${colors.reset}\n`);

    choices.forEach((choice, index) => {
      const numStr = `${index + 1}. `.padStart(4);
      if (index === selectedIndex) {
        console.log(
          `${colors.bgCyan} > ${numStr}${choice.label} ${colors.reset}`,
        );
      } else {
        console.log(`   ${colors.dim}${numStr}${colors.reset}${choice.label}`);
      }
    });

    console.log(
      `\n${colors.dim}Use ↑/↓ arrow keys or type number and press Enter (q to quit):${colors.reset}`,
    );
  }

  if (!isTTY) {
    // Non-interactive fallback
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    renderHeader();
    if (title) console.log(`${title}\n`);
    choices.forEach((c, i) => console.log(`${i + 1}. ${c.label}`));
    rl.question('\nSelect option number: ', (answer) => {
      rl.close();
      const idx = parseInt(answer, 10) - 1;
      if (idx >= 0 && idx < choices.length) {
        onSelect(choices[idx]);
      } else {
        showMenu(title, choices, onSelect);
      }
    });
    return;
  }

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  let numberBuffer = '';

  const onKeypress = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      cleanup();
      process.exit();
    }

    if (key.name === 'q') {
      cleanup();
      mainMenu();
      return;
    }

    if (key.name === 'up') {
      selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
      numberBuffer = '';
      render();
    } else if (key.name === 'down') {
      selectedIndex = (selectedIndex + 1) % choices.length;
      numberBuffer = '';
      render();
    } else if (key.name === 'return') {
      if (numberBuffer.length > 0) {
        const num = parseInt(numberBuffer, 10);
        if (num >= 1 && num <= choices.length) {
          selectedIndex = num - 1;
        }
      }
      cleanup();
      onSelect(choices[selectedIndex]);
    } else if (/\d/.test(str)) {
      numberBuffer += str;
      const num = parseInt(numberBuffer, 10);
      if (num >= 1 && num <= choices.length) {
        selectedIndex = num - 1;
        render();
      } else if (num > choices.length) {
        numberBuffer = str;
        const fallbackNum = parseInt(numberBuffer, 10);
        if (fallbackNum >= 1 && fallbackNum <= choices.length) {
          selectedIndex = fallbackNum - 1;
          render();
        }
      }
    }
  };

  function cleanup() {
    process.stdin.removeListener('keypress', onKeypress);
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
  }

  process.stdin.on('keypress', onKeypress);
  render();
}

/**
 * Main Menu
 */
function mainMenu() {
  const allFiles = getFilesRecursively(TESTS_DIR).map(toRelativePath);

  // Extract subdirectories under tests/
  const folders = new Set();
  allFiles.forEach((file) => {
    const parts = file.split('/');
    if (parts.length > 2) {
      folders.add(parts.slice(0, -1).join('/'));
    }
  });

  const choices = [
    {
      key: 'all',
      label: `${colors.bold}🚀 Run ALL Tests${colors.reset} (${allFiles.length} test files)`,
    },
    {
      key: 'folders',
      label: `📁 Run Tests by Subfolder (${folders.size} subfolders available)`,
    },
    { key: 'files', label: `📄 Select Specific Test File` },
    { key: 'settings', label: `⚙️  Toggle Playwright Settings / Flags` },
    { key: 'exit', label: `🚪 Exit` },
  ];

  showMenu(`${colors.bold}Main Menu${colors.reset}`, choices, (selected) => {
    switch (selected.key) {
      case 'all':
        runCommand('npx', buildPlaywrightArgs(), mainMenu);
        break;
      case 'folders':
        subfolderMenu(Array.from(folders));
        break;
      case 'files':
        fileSelectMenu(allFiles);
        break;
      case 'settings':
        settingsMenu();
        break;
      case 'exit':
        clearScreen();
        console.log(`${colors.cyan}Goodbye!${colors.reset}\n`);
        process.exit(0);
        break;
    }
  });
}

/**
 * Subfolder Selection Menu
 */
function subfolderMenu(folders) {
  if (folders.length === 0) {
    console.log(
      `${colors.yellow}No subfolders found inside tests directory.${colors.reset}`,
    );
    setTimeout(mainMenu, 1500);
    return;
  }

  const choices = folders.map((folder) => ({
    key: folder,
    label: `📁 ${folder}`,
  }));
  choices.push({ key: 'back', label: `⬅️  Back to Main Menu` });

  showMenu(
    `${colors.bold}Select Folder to Run${colors.reset}`,
    choices,
    (selected) => {
      if (selected.key === 'back') {
        mainMenu();
      } else {
        runCommand('npx', buildPlaywrightArgs(selected.key), mainMenu);
      }
    },
  );
}

/**
 * File Selection Menu
 */
function fileSelectMenu(files) {
  if (files.length === 0) {
    console.log(
      `${colors.yellow}No test files found inside tests directory.${colors.reset}`,
    );
    setTimeout(mainMenu, 1500);
    return;
  }

  const choices = files.map((file) => ({
    key: file,
    label: `📄 ${file}`,
  }));
  choices.push({ key: 'back', label: `⬅️  Back to Main Menu` });

  showMenu(
    `${colors.bold}Select Test File to Run${colors.reset}`,
    choices,
    (selected) => {
      if (selected.key === 'back') {
        mainMenu();
      } else {
        runCommand('npx', buildPlaywrightArgs(selected.key), mainMenu);
      }
    },
  );
}

/**
 * Settings Menu
 */
function settingsMenu() {
  const choices = [
    {
      key: 'headed',
      label: `Toggle Headed Mode: ${config.headed ? colors.green + '[ON]' : colors.red + '[OFF]'}`,
    },
    {
      key: 'ui',
      label: `Toggle Playwright UI Mode: ${config.ui ? colors.green + '[ON]' : colors.red + '[OFF]'}`,
    },
    {
      key: 'debug',
      label: `Toggle Debug Mode: ${config.debug ? colors.green + '[ON]' : colors.red + '[OFF]'}`,
    },
    {
      key: 'project',
      label: `Set Project Filter (Current: ${config.project || 'None'})`,
    },
    {
      key: 'custom',
      label: `Set Custom CLI Arguments (Current: "${config.customArgs || 'None'}")`,
    },
    { key: 'back', label: `⬅️  Back to Main Menu` },
  ];

  showMenu(
    `${colors.bold}Playwright Execution Settings${colors.reset}`,
    choices,
    (selected) => {
      switch (selected.key) {
        case 'headed':
          config.headed = !config.headed;
          settingsMenu();
          break;
        case 'ui':
          config.ui = !config.ui;
          settingsMenu();
          break;
        case 'debug':
          config.debug = !config.debug;
          settingsMenu();
          break;
        case 'project':
          promptInput(
            'Enter project name (e.g., chromium, setup) or press Enter to clear:',
            (val) => {
              config.project = val.trim();
              settingsMenu();
            },
          );
          break;
        case 'custom':
          promptInput(
            'Enter custom Playwright arguments (e.g., --grep @auth):',
            (val) => {
              config.customArgs = val.trim();
              settingsMenu();
            },
          );
          break;
        case 'back':
          mainMenu();
          break;
      }
    },
  );
}

/**
 * Helper to prompt simple text input using readline interface.
 */
function promptInput(promptText, callback) {
  clearScreen();
  renderHeader();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`${colors.bold}${promptText}${colors.reset}\n> `, (answer) => {
    rl.close();
    callback(answer);
  });
}

// Start application
mainMenu();
