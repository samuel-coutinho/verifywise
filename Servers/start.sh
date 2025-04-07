#!/bin/sh

echo "Running database migrations..."
npm run migrate-db

echo "Starting server..."
node dist/index.js
