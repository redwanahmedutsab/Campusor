from django.contrib import admin
from .models import LostFoundItem


@admin.register(LostFoundItem)
class LostFoundAdmin(admin.ModelAdmin):
    list_display = ('title', 'item_type', 'category', 'status',
                    'posted_by', 'location', 'date_occurred', 'created_at')
    list_filter = ('item_type', 'category', 'status')
    search_fields = ('title', 'description', 'posted_by__email', 'location')
    list_editable = ('status',)
    ordering = ('-created_at',)
