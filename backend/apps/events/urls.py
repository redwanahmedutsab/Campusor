"""
apps/events/urls.py — prefixed /api/events/
"""
from django.urls import path
from .views import (
    EventListCreateView, EventDetailView,
    RSVPView, MyEventsView, MyRSVPsView,
)

urlpatterns = [
    path('',                   EventListCreateView.as_view(), name='event-list'),
    path('mine/',              MyEventsView.as_view(),        name='my-events'),
    path('attending/',         MyRSVPsView.as_view(),         name='my-rsvps'),
    path('<int:pk>/',          EventDetailView.as_view(),     name='event-detail'),
    path('<int:pk>/rsvp/',     RSVPView.as_view(),            name='event-rsvp'),
]
