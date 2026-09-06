#!/usr/bin/env bash
set -euo pipefail
node --version
npm --version
npm install
npm run seed
echo "Setup complete. Run: npm run dev"
