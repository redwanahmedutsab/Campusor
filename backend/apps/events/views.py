"""
apps/events/views.py
"""
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Event, RSVP
from .serializers import (
    EventListSerializer, EventDetailSerializer,
    EventCreateSerializer, RSVPSerializer,
)


class EventFilter(django_filters.FilterSet):
    upcoming = django_filters.BooleanFilter(method='filter_upcoming')
    search   = django_filters.CharFilter(method='filter_search')

    class Meta:
        model  = Event
        fields = ['category', 'status', 'is_free']

    def filter_upcoming(self, queryset, name, value):
        from django.utils import timezone
        if value:
            return queryset.filter(start_datetime__gte=timezone.now())
        return queryset

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(location__icontains=value) |
            Q(tags__icontains=value)
        )


class EventListCreateView(generics.ListCreateAPIView):
    """GET /api/events/  |  POST /api/events/"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class    = EventFilter
    ordering_fields    = ['start_datetime', 'created_at', 'attendee_count']
    ordering           = ['start_datetime']

    def get_queryset(self):
        return Event.objects.exclude(
            status='cancelled'
        ).select_related('organizer').prefetch_related('rsvps')

    def get_serializer_class(self):
        return EventCreateSerializer if self.request.method == 'POST' \
               else EventListSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/events/<id>/"""
    queryset           = Event.objects.all().select_related(
                             'organizer').prefetch_related('rsvps')
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return EventCreateSerializer
        return EventDetailSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class RSVPView(APIView):
    """POST /api/events/<id>/rsvp/ — toggle RSVP"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found.'}, status=404)

        rsvp_status = request.data.get('status', 'going')

        if event.is_full and rsvp_status == 'going':
            existing = RSVP.objects.filter(user=request.user, event=event).first()
            if not existing or existing.status != 'going':
                return Response({'error': 'Event is full.'}, status=400)

        rsvp, created = RSVP.objects.update_or_create(
            user=request.user, event=event,
            defaults={'status': rsvp_status}
        )
        return Response({
            'status':         rsvp.status,
            'attendee_count': event.attendee_count,
        }, status=201 if created else 200)


class MyEventsView(generics.ListAPIView):
    """GET /api/events/mine/ — events I organized"""
    serializer_class   = EventListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user
        ).prefetch_related('rsvps').order_by('-created_at')


class MyRSVPsView(generics.ListAPIView):
    """GET /api/events/attending/ — events I RSVP'd to"""
    serializer_class   = EventListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        event_ids = RSVP.objects.filter(
            user=self.request.user, status='going'
        ).values_list('event_id', flat=True)
        return Event.objects.filter(
            id__in=event_ids
        ).prefetch_related('rsvps').order_by('start_datetime')
