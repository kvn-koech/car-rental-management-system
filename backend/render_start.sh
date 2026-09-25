#!/usr/bin/env bash
set -o errexit

echo "Initializing database tables..."
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"

exec gunicorn 'app:create_app()'