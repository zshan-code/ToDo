from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'due_date', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'due_date', 'created_at')
    search_fields = ('name', 'title', 'description')
    list_editable = ('is_completed',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Task Information', {
            'fields': ('name', 'title', 'description')
        }),
        ('Date Information', {
            'fields': ('due_date', 'created_at')
        }),
        ('Status', {
            'fields': ('is_completed',)
        }),
    )
    
    readonly_fields = ('created_at',)
