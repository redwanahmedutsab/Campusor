"""
apps/events/models.py
"""
from django.db import models
from django.conf import settings


class Event(models.Model):

    CATEGORY_CHOICES = (
        ('academic',    'Academic'),
        ('cultural',    'Cultural'),
        ('sports',      'Sports'),
        ('tech',        'Tech & Innovation'),
        ('social',      'Social'),
        ('workshop',    'Workshop'),
        ('career',      'Career & Jobs'),
        ('other',       'Other'),
    )

    STATUS_CHOICES = (
        ('upcoming',   'Upcoming'),
        ('ongoing',    'Ongoing'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
    )

    organizer    = models.ForeignKey(
                       settings.AUTH_USER_MODEL,
                       on_delete=models.CASCADE,
                       related_name='organized_events'
                   )
    title        = models.CharField(max_length=200)
    description  = models.TextField()
    category     = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default='other')
    status       = models.CharField(max_length=12, choices=STATUS_CHOICES, default='upcoming')

    # Time & place
    start_datetime = models.DateTimeField()
    end_datetime   = models.DateTimeField(null=True, blank=True)
    location       = models.CharField(max_length=300)
    venue          = models.CharField(max_length=200, blank=True,
                                      help_text="e.g. Auditorium, Room 301")

    # Capacity & cost
    max_attendees  = models.PositiveIntegerField(null=True, blank=True)
    is_free        = models.BooleanField(default=True)
    ticket_price   = models.DecimalField(max_digits=8, decimal_places=2,
                                         null=True, blank=True)

    banner_image   = models.ImageField(upload_to='events/%Y/%m/', null=True, blank=True)
    tags           = models.CharField(max_length=300, blank=True,
                                      help_text="comma-separated tags")
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_datetime']

    def __str__(self):
        return f"{self.title} — {self.start_datetime.strftime('%b %d %Y')}"

    @property
    def attendee_count(self):
        return self.rsvps.filter(status='going').count()

    @property
    def is_full(self):
        if not self.max_attendees:
            return False
        return self.attendee_count >= self.max_attendees


class RSVP(models.Model):
    STATUS_CHOICES = (
        ('going',     'Going'),
        ('maybe',     'Maybe'),
        ('not_going', 'Not Going'),
    )

    user    = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE, related_name='rsvps')
    event   = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    status  = models.CharField(max_length=12, choices=STATUS_CHOICES, default='going')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

    def __str__(self):
        return f"{self.user.username} → {self.event.title} ({self.status})"
