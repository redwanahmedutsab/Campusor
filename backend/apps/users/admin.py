from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import StudentUser


@admin.register(StudentUser)
class StudentUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'full_name', 'university',
                    'department', 'role', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'university', 'department')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'student_id')
    ordering = ('-created_at',)
    list_editable = ('is_verified', 'role')

    fieldsets = UserAdmin.fieldsets + (
        ('Campus Info', {
            'fields': ('student_id', 'department', 'university',
                       'phone', 'bio', 'profile_picture', 'role', 'is_verified')
        }),
    )
