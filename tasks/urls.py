from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/tasks/', views.get_tasks, name='get_tasks'),
    path('api/tasks/create/', views.create_task, name='create_task'),
    path('api/tasks/<int:task_id>/update/', views.update_task, name='update_task'),
    path('api/tasks/<int:task_id>/toggle/', views.toggle_task_completion, name='toggle_task_completion'),
    path('api/tasks/<int:task_id>/delete/', views.delete_task, name='delete_task'),
] 