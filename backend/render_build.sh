#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
flask db upgrade

if [ "$SEED_DB" = "true" ]; then
    echo "SEED_DB is true. Running seeder..."
    python seed.py
else
    echo "Database initialised via migrations."
fi
