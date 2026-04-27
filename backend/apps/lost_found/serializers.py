from rest_framework import serializers
from .models import LostFoundItem


class LostFoundSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.full_name', read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = LostFoundItem
        fields = [
            'id', 'item_type', 'title', 'description', 'category', 'status',
            'location', 'date_occurred', 'image',
            'contact_name', 'contact_email', 'contact_phone',
            'posted_by_name', 'is_owner', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.posted_by == request.user
        return False

    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)
