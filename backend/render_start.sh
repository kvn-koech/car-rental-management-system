#!/usr/bin/env bash
set -o errexit

echo "Initializing database tables..."
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"

echo "Ensuring the initial fleet is available..."
python -c "from seed import seed_fleet_if_empty; seed_fleet_if_empty()"

exec gunicorn 'app:create_app()'