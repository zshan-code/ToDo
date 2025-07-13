import os
import sys

# Add debugging
print("Starting Django application...")
print(f"Python path: {sys.path}")
print(f"Current directory: {os.getcwd()}")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "todo_project.settings")

try:
    from django.core.wsgi import get_wsgi_application
    print("Django WSGI imported successfully")
    app = get_wsgi_application()
    print("Django application created successfully")
except Exception as e:
    print(f"Error creating Django application: {e}")
    raise 