from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class WorkoutSession(models.Model):
    date = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_sessions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.owner.username}'s Workout on {self.date}"

class Exercise(models.Model):
    name = models.CharField(max_length=255)
    sets = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    reps = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    weight = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='exercises')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name}: {self.sets} sets x {self.reps} reps @ {self.weight} kg"
