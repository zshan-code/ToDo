from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from .models import Task

def index(request):
    """Main page view"""
    return render(request, 'tasks/index.html')

@require_http_methods(["GET"])
def get_tasks(request):
    """Get all tasks"""
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

@require_http_methods(["POST"])
def create_task(request):
    """Create a new task"""
    try:
        data = json.loads(request.body)
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
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

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
