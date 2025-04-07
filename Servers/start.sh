#!/bin/sh

echo "Running database migrations..."
npx sequelize db:migrate

echo "Starting server..."
exec node dist/index.js

