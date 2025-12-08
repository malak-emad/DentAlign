from django.contrib import admin
from .models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_id', 'description']
    search_fields = ['name']
    readonly_fields = ['role_id']


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'short_id', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['username', 'email']
    readonly_fields = ['user_id', 'short_id', 'created_at', 'updated_at']
