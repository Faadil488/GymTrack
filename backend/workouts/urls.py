from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    UserRegisterView,
    WorkoutSessionViewSet,
    WorkoutExerciseCreateView,
    ExerciseDetailView,
)

router = DefaultRouter()
router.register(r'workouts', WorkoutSessionViewSet, basename='workout')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', UserRegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Workout routes (GET /api/workouts/, POST /api/workouts/, etc.)
    path('', include(router.urls)),
    
    # Exercise creation under a workout session (POST /api/workouts/<workout_id>/exercises/)
    path('workouts/<int:workout_id>/exercises/', WorkoutExerciseCreateView.as_view(), name='workout-exercise-create'),
    
    # Exercise details: edit/delete (PUT/PATCH/DELETE /api/exercises/<id>/)
    path('exercises/<int:pk>/', ExerciseDetailView.as_view(), name='exercise-detail'),
]
