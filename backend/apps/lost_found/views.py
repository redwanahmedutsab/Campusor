"""
apps/lost_found/views.py
"""
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import LostFoundItem
from .serializers import LostFoundSerializer


class LostFoundFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model  = LostFoundItem
        fields = ['item_type', 'category', 'status']

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(location__icontains=value)
        )


class LostFoundListCreateView(generics.ListCreateAPIView):
    """GET /api/lost-found/  |  POST /api/lost-found/"""
    serializer_class   = LostFoundSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class    = LostFoundFilter
    ordering           = ['-created_at']

    def get_queryset(self):
        return LostFoundItem.objects.select_related('posted_by')

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class LostFoundDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/lost-found/<id>/"""
    queryset           = LostFoundItem.objects.all().select_related('posted_by')
    serializer_class   = LostFoundSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def update(self, request, *args, **kwargs):
        if self.get_object().posted_by != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if self.get_object().posted_by != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class MarkResolvedView(APIView):
    """POST /api/lost-found/<id>/resolve/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            item = LostFoundItem.objects.get(pk=pk, posted_by=request.user)
        except LostFoundItem.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        item.status = 'resolved'
        item.save()
        return Response({'message': 'Marked as resolved.'})


class MyItemsView(generics.ListAPIView):
    """GET /api/lost-found/mine/"""
    serializer_class   = LostFoundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LostFoundItem.objects.filter(
            posted_by=self.request.user
        ).order_by('-created_at')
