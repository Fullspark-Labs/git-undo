#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'git-undo');
const CONFIG_FILE = path.join(CONFIG_DIR, 'history.json');
const HOOKS_DIR = path.join(CONFIG_DIR, 'hooks');

if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}
if (!fs.existsSync(HOOKS_DIR)) {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
}

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
}

function gitDirect(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: 'inherit', shell: true });
}

function getHistory() {
  if (!fs.existsSync(CONFIG_FILE)) return [];
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function saveHistory(action) {
  const history = getHistory();
  history.unshift({ ...action, timestamp: Date.now() });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(history.slice(0, 100), 'utf8');
}

function confirm(question) {
  return new Promise(resolve => {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question + ' [y/N] ', answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function listHistory() {
  const history = getHistory();
  if (history.length === 0) {
    console.log('No undo history.');
    return;
  }
  console.log('\n📋 Undo History:\n');
  history.slice(0, 10).forEach((h, i) => {
    const time = new Date(h.timestamp).toLocaleString();
    console.log(`  ${i + 1}. ${h.action} - ${time}`);
    console.log(`     ${h.details}`);
  });
}

async function undoCommit() {
  const log = git('log --oneline -10');
  console.log('\n📋 Recent Commits:\n' + log);
  
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  const commit = await new Promise(r => rl.question('\nCommit to undo (hash or number): ', r));
  rl.close();
  
  if (!commit) return;
  
  let hash = commit;
  if (!commit.match(/^[a-f0-9]+$/)) {
    const num = parseInt(commit);
    if (num > 0 && num <= 10) {
      const commits = log.split('\n');
      hash = commits[num - 1].split(' ')[0];
    }
  }
  
  const sure = await confirm(`Undo commit ${hash.slice(0, 7)}?`);
  if (!sure) return;
  
  gitDirect(`reset --hard ${hash}^`);
  saveHistory({ action: 'undo-commit', details: hash.slice(0, 7) });
  console.log('✅ Undo complete.');
}

async function undoPush() {
  const log = git('log --oneline -5 origin/HEAD..HEAD');
  console.log('\n📋 Commits to push:\n' + (log || '(none)'));
  
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  const count = await new Promise(r => rl.question('Number of commits to undo: ', r));
  rl.close();
  
  const n = parseInt(count) || 1;
  const sure = await confirm(`Undo last ${n} push(es)?`);
  if (!sure) return;
  
  gitDirect(`reset --hard HEAD~${n}`);
  gitDirect(`push --force`);
  saveHistory({ action: 'undo-push', details: `reverted ${n} commits` });
  console.log('✅ Push undone.');
}

async function undoMerge() {
  const merges = git('log --merges --oneline -10');
  console.log('\n📋 Recent Merges:\n' + (merges || 'None'));
  
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  const hash = await new Promise(r => rl.question('\nMerge commit hash: ', r));
  rl.close();
  
  if (!hash) return;
  
  const sure = await confirm(`Undo merge ${hash.slice(0, 7)}?`);
  if (!sure) return;
  
  try {
    gitDirect(`reset --hard ${hash}^`);
    gitDirect(`push --force`);
    saveHistory({ action: 'undo-merge', details: hash.slice(0, 7) });
    console.log('✅ Merge undone.');
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
}

async function undoStash() {
  const stashes = git('stash list --oneline');
  console.log('\n📋 Stashes:\n' + (stashes || 'None'));
  
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  const num = await new Promise(r => rl.question('Stash number (0 to drop): ', r));
  rl.close();
  
  const n = parseInt(num);
  if (isNaN(n) || n < 0) return;
  
  if (n === 0) return;
  
  const sure = await confirm(`Drop stash@{${n}}?`);
  if (!sure) return;
  
  gitDirect(`stash drop stash@{${n}}`);
  saveHistory({ action: 'drop-stash', details: `stash@{${n}}` });
  console.log('✅ Stash dropped.');
}

function showHelp() {
  console.log(`
git-undo - Safely undo git operations

Usage: git-undo <command>

Commands:
  commit          - Undo a commit (go back in time)
  push           - Undo a push (revert remote)
  merge          - Undo a merge
  stash          - Drop a stash
  history        - Show undo history
  help           - Show this help

Examples:
  git-undo commit     # Interactive commit undo
  git-undo push      # Undo last push
  git-undo history   # View history
`);
}

const cmd = process.argv[2];

const commands = {
  commit: undoCommit,
  push: undoPush,
  merge: undoMerge,
  stash: undoStash,
  history: listHistory,
  help: showHelp,
  '-h': showHelp,
  '--help': showHelp
};

if (!cmd || cmd === 'i' || cmd === 'interactive') {
  showHelp();
} else if (commands[cmd]) {
  commands[cmd]();
} else {
  console.log('Unknown command. Run: git-undo help');
}