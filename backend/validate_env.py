import os
import sys

def validate():
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'FRONTEND_URL'
    ]
    
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    if missing:
        print("CRITICAL: Missing required environment variables:")
        for var in missing:
            print(f" - {var}")
        sys.exit(1)
    else:
        print("All required environment variables are set.")
        sys.exit(0)

if __name__ == "__main__":
    validate()
