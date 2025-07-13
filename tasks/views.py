from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
import logging
from datetime import datetime
from .models import Task
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

# Set up logging
logger = logging.getLogger(__name__)

def index(request):
    """Main page view"""
    return render(request, 'tasks/index.html')

@require_http_methods(["GET"])
def get_tasks(request):
    """Get all tasks"""
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        tasks = Task.objects.all()
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': task.id,
                'name': task.name,
                'title': task.title,
                'description': task.description,
                'due_date': task.due_date.strftime('%Y-%m-%d'),
                'is_completed': task.is_completed,
                'created_at': task.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return JsonResponse({'tasks': tasks_data})
    except Exception as e:
        logger.error(f"Error in get_tasks: {str(e)}")
        return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)

@require_http_methods(["POST"])
@csrf_exempt
def create_task(request):
    """Create a new task"""
    try:
        # Log the request
        logger.info(f"Creating task with body: {request.body}")
        
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ['name', 'title', 'description', 'due_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return JsonResponse({'success': False, 'error': f'Missing required field: {field}'}, status=400)
        
        task = Task.objects.create(
            name=data['name'],
            title=data['title'],
            description=data['description'],
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        )
        return JsonResponse({
            'success': True,
            'task': {
                'id': task.id,
                'name': task.name,
                'title': task.title,
                'description': task.description,
                'due_date': task.due_date.strftime('%Y-%m-%d'),
                'is_completed': task.is_completed,
                'created_at': task.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        return JsonResponse({'success': False, 'error': f'Invalid date format: {str(e)}'}, status=400)
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["PUT"])
def update_task(request, task_id):
    """Update an existing task"""
    try:
        task = get_object_or_404(Task, id=task_id)
        data = json.loads(request.body)
        
        task.name = data['name']
        task.title = data['title']
        task.description = data['description']
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        task.save()
        
        return JsonResponse({
            'success': True,
            'task': {
                'id': task.id,
                'name': task.name,
                'title': task.title,
                'description': task.description,
                'due_date': task.due_date.strftime('%Y-%m-%d'),
                'is_completed': task.is_completed,
                'created_at': task.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@require_http_methods(["PATCH"])
def toggle_task_completion(request, task_id):
    """Toggle task completion status"""
    try:
        task = get_object_or_404(Task, id=task_id)
        task.is_completed = not task.is_completed
        task.save()
        
        return JsonResponse({
            'success': True,
            'is_completed': task.is_completed
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@require_http_methods(["DELETE"])
def delete_task(request, task_id):
    """Delete a task"""
    try:
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

def test_endpoint(request):
    """Simple test endpoint to verify Django is working"""
    return JsonResponse({
        'status': 'Django is running',
        'message': 'This endpoint works without database connection'
    })

def health_check(request):
    """Health check endpoint to test if Django and database are working"""
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'django': 'running'
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
