#!/usr/bin/env node
'use strict';

/**
 * boot-env.js — Proper .env loader for Windows paths
 *
 * Bash `source` mangles Windows-style .env values: backslashes are eaten
 * (`C:\Users` → `C:Users`) and semicolon-separated lists are split into
 * commands. This loader parses .env verbatim, preserving `C:\...` paths and
 * `;` separators, then boots the GSK daemon.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ENV_FILE = path.join(__dirname, '.env');

function loadEnv(file) {
    if (!fs.existsSync(file)) return {};
    const env = {};
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;
        // Strip optional export prefix
        if (line.startsWith('export ')) line = line.slice(7);
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
    return env;
}

const fileEnv = loadEnv(ENV_FILE);
const mergedEnv = { ...process.env, ...fileEnv };
for (const key of Object.keys(mergedEnv)) {
    if (!process.env[key]) process.env[key] = mergedEnv[key];
}

// Verify the semicolon-separated roots survive.
const roots = (process.env.GSK_PROJECT_ROOTS || '').split(';').map(r => r.trim()).filter(Boolean);
console.log('[boot-env] GSK_PROJECT_ROOTS:', JSON.stringify(process.env.GSK_PROJECT_ROOTS));
console.log('[boot-env] Existing roots:', roots.filter(r => fs.existsSync(r)).length + '/' + roots.length);

const daemon = spawn(process.execPath, ['gsk_daemon.js'], {
    cwd: __dirname,
    env: process.env,
    stdio: 'inherit'
});

daemon.on('exit', (code, signal) => {
    console.log('[boot-env] GSK daemon exited:', code, signal);
    process.exit(code || 0);
});
