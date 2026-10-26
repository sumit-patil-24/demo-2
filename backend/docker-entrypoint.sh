#!/bin/sh
set -e
echo "Applying database schema..."
npx prisma db push --skip-generate
echo "Seeding (idempotent)..."
node prisma/seed.js
echo "Starting API..."
exec node src/server.js
