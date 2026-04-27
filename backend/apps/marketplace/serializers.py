from rest_framework import serializers
from .models import Product, ProductImage, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'uploaded_at']


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_avatar = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'price', 'is_free', 'condition', 'status',
            'location', 'views_count', 'primary_image',
            'seller_name', 'seller_avatar', 'category_name', 'category_icon',
            'created_at',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_seller_avatar(self, obj):
        if obj.seller.profile_picture:
            request = self.context.get('request')
            return request.build_absolute_uri(
                obj.seller.profile_picture.url) if request else None
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    seller_phone = serializers.CharField(source='seller.phone', read_only=True)
    seller_dept = serializers.CharField(source='seller.department', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'is_free',
            'condition', 'status', 'location', 'views_count',
            'images', 'seller_name', 'seller_email', 'seller_phone',
            'seller_dept', 'category_name', 'is_owner', 'created_at', 'updated_at',
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.seller == request.user
        return False


class ProductCreateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'title', 'description', 'price', 'is_free',
            'condition', 'category', 'location', 'uploaded_images',
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('uploaded_images', [])
        product = Product.objects.create(**validated_data)
        for i, image in enumerate(images_data):
            ProductImage.objects.create(
                product=product, image=image, is_primary=(i == 0)
            )
        return product
