from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from .models import WorkoutSession, Exercise
from .serializers import UserRegisterSerializer, WorkoutSessionSerializer, ExerciseSerializer

class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "User registered successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)

class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Enforce security: restrict all operations to the logged-in user's data
        return WorkoutSession.objects.filter(owner=self.request.user).prefetch_related('exercises')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class WorkoutExerciseCreateView(generics.CreateAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        workout_id = self.kwargs.get('workout_id')
        # Enforce security: verify parent workout session exists and is owned by the user
        workout = get_object_or_404(WorkoutSession, id=workout_id, owner=self.request.user)
        serializer.save(session=workout)

class ExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Enforce security: only allow operations on exercises belonging to user's workouts
        return Exercise.objects.filter(session__owner=self.request.user)
