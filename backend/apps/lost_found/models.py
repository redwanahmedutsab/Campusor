"""
apps/lost_found/models.py
"""
from django.db import models
from django.conf import settings


class LostFoundItem(models.Model):

    TYPE_CHOICES = (
        ('lost',  'Lost'),
        ('found', 'Found'),
    )

    STATUS_CHOICES = (
        ('open',     'Open'),
        ('resolved', 'Resolved'),
        ('closed',   'Closed'),
    )

    CATEGORY_CHOICES = (
        ('electronics', 'Electronics'),
        ('clothing',    'Clothing & Accessories'),
        ('books',       'Books & Stationery'),
        ('id_card',     'ID / Student Card'),
        ('keys',        'Keys'),
        ('bag',         'Bag / Backpack'),
        ('wallet',      'Wallet / Purse'),
        ('other',       'Other'),
    )

    posted_by     = models.ForeignKey(
                        settings.AUTH_USER_MODEL,
                        on_delete=models.CASCADE,
                        related_name='lost_found_items'
                    )
    item_type     = models.CharField(max_length=6, choices=TYPE_CHOICES)
    title         = models.CharField(max_length=200)
    description   = models.TextField()
    category      = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default='other')
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    location      = models.CharField(max_length=300,
                                     help_text="Where it was lost or found")
    date_occurred = models.DateField(help_text="Date it was lost or found")
    image         = models.ImageField(upload_to='lost_found/%Y/%m/', null=True, blank=True)

    # Contact — can be different from poster's profile
    contact_name  = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.item_type.upper()}] {self.title} — {self.posted_by.username}"
