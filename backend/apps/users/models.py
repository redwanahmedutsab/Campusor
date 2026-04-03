"""
apps/users/models.py — StudentUser Model
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class StudentUser(AbstractUser):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin',   'Admin'),
    )

    email       = models.EmailField(unique=True)
    student_id  = models.CharField(max_length=30, blank=True)
    department  = models.CharField(max_length=100, blank=True)
    university  = models.CharField(max_length=200, blank=True)
    phone       = models.CharField(max_length=20, blank=True)
    bio         = models.TextField(max_length=300, blank=True)
    profile_picture = models.ImageField(
        upload_to='profiles/', blank=True, null=True
    )
    role        = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    is_verified = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Student'
        ordering     = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.email})"

    @property
    def full_name(self):
        return self.get_full_name() or self.username
