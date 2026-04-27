from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import StudentUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm Password')

    class Meta:
        model = StudentUser
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'student_id', 'department', 'university',
            'phone', 'password', 'password2',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_username(self, value):
        if len(value) < 4:
            raise serializers.ValidationError("Username must be at least 4 characters.")
        return value

    def validate_email(self, value):
        if StudentUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = StudentUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = StudentUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'student_id', 'department', 'university',
            'phone', 'bio', 'profile_picture', 'role',
            'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'created_at', 'role']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True,
                                         validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password2": "Passwords do not match."})
        return attrs
