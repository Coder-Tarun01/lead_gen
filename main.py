import sys
import os

# Redirect logic to allow Render to find the FastAPI app from the root
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from main import app
