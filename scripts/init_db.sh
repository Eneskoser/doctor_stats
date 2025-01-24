#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Set Python path
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Initialize database
python app/db/init_db.py

echo "Database initialization completed successfully!" 