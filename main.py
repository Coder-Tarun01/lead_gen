import os
import sys

# Bridge to the backend folder
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import using the package path to avoid naming confusion
from backend.main import app
