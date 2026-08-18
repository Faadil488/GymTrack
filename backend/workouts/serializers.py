from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import WorkoutSession, Exercise

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ('id', 'name', 'sets', 'reps', 'weight', 'session', 'created_at')
        read_only_fields = ('session',)

    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Exercise name cannot be empty or whitespace only.")
        return cleaned

class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, required=False)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = WorkoutSession
        fields = ('id', 'date', 'owner', 'exercises', 'created_at')

    @transaction.atomic
    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        # owner will be set by the view's perform_create
        workout_session = WorkoutSession.objects.create(**validated_data)
        for exercise_data in exercises_data:
            Exercise.objects.create(session=workout_session, **exercise_data)
        return workout_session

