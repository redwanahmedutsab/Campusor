"""
apps/marketplace/views.py
"""
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, ProductImage, Category
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, CategorySerializer,
)
from .filters import ProductFilter


class CategoryListView(generics.ListAPIView):
    """GET /api/marketplace/categories/"""
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = []


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/marketplace/products/   → public list
    POST /api/marketplace/products/   → create (auth)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class    = ProductFilter
    ordering_fields    = ['price', 'created_at', 'views_count']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(
            status='active'
        ).select_related('seller', 'category').prefetch_related('images')

    def get_serializer_class(self):
        return ProductCreateSerializer if self.request.method == 'POST' \
               else ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/marketplace/products/<id>/"""
    queryset           = Product.objects.all().select_related(
                             'seller', 'category').prefetch_related('images')
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductCreateSerializer
        return ProductDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Product.objects.filter(pk=instance.pk).update(
            views_count=instance.views_count + 1
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Not allowed.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class MyProductsView(generics.ListAPIView):
    """GET /api/marketplace/products/mine/"""
    serializer_class   = ProductListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(
            seller=self.request.user
        ).prefetch_related('images').order_by('-created_at')


class MarkSoldView(APIView):
    """POST /api/marketplace/products/<id>/mark-sold/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, seller=request.user)
        except Product.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        product.status = 'sold'
        product.save()
        return Response({'message': 'Marked as sold.'})
