from rest_framework import serializers
from .models import Event, RSVP


class EventListSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    attendee_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    user_rsvp = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'category', 'status', 'start_datetime',
            'end_datetime', 'location', 'venue', 'is_free', 'ticket_price',
            'max_attendees', 'attendee_count', 'is_full', 'banner_image',
            'organizer_name', 'user_rsvp', 'created_at',
        ]

    def get_user_rsvp(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rsvp = obj.rsvps.filter(user=request.user).first()
            return rsvp.status if rsvp else None
        return None


class EventDetailSerializer(EventListSerializer):
    description = serializers.CharField()
    tags = serializers.CharField()

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + ['description', 'tags', 'updated_at']


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'category', 'start_datetime', 'end_datetime',
            'location', 'venue', 'max_attendees', 'is_free', 'ticket_price',
            'banner_image', 'tags',
        ]

    def validate(self, attrs):
        if attrs.get('end_datetime') and attrs['end_datetime'] < attrs['start_datetime']:
            raise serializers.ValidationError(
                {"end_datetime": "End time must be after start time."}
            )
        return attrs


class RSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = ['id', 'status', 'created_at']
