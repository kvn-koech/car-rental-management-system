#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

echo "Initializing database tables..."
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"
