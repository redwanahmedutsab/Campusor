from django.contrib import admin
from .models import Product, ProductImage, Category


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'is_primary', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'category', 'price',
                    'condition', 'status', 'created_at')
    list_filter = ('status', 'condition', 'category', 'is_free')
    search_fields = ('title', 'description', 'seller__email')
    list_editable = ('status',)
    inlines = [ProductImageInline]
