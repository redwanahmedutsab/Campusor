"""
apps/marketplace/urls.py — prefixed /api/marketplace/
"""
from django.urls import path
from .views import (
    CategoryListView, ProductListCreateView, ProductDetailView,
    MyProductsView, MarkSoldView,
)

urlpatterns = [
    path('categories/',              CategoryListView.as_view(),      name='categories'),
    path('products/',                ProductListCreateView.as_view(), name='product-list'),
    path('products/mine/',           MyProductsView.as_view(),        name='my-products'),
    path('products/<int:pk>/',       ProductDetailView.as_view(),     name='product-detail'),
    path('products/<int:pk>/mark-sold/', MarkSoldView.as_view(),      name='mark-sold'),
]
