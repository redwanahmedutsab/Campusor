"""
apps/lost_found/urls.py — prefixed /api/lost-found/
"""
from django.urls import path
from .views import (
    LostFoundListCreateView, LostFoundDetailView,
    MarkResolvedView, MyItemsView,
)

urlpatterns = [
    path('',                      LostFoundListCreateView.as_view(), name='lostfound-list'),
    path('mine/',                 MyItemsView.as_view(),             name='my-items'),
    path('<int:pk>/',             LostFoundDetailView.as_view(),     name='lostfound-detail'),
    path('<int:pk>/resolve/',     MarkResolvedView.as_view(),        name='lostfound-resolve'),
]
