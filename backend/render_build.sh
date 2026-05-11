#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

if [ "$SEED_DB" = "true" ]; then
    echo "SEED_DB is true. Running seeder..."
    python seed.py
else
    echo "Initializing database tables..."
    python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"
fi
