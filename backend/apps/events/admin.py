from django.contrib import admin
from .models import Event, RSVP


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'category', 'status',
                    'start_datetime', 'attendee_count', 'is_free')
    list_filter = ('status', 'category', 'is_free')
    search_fields = ('title', 'organizer__email', 'location')
    list_editable = ('status',)
    ordering = ('start_datetime',)


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'status', 'created_at')
    list_filter = ('status',)
