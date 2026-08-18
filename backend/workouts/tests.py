from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import WorkoutSession, Exercise

class GymTrackAPITests(APITestCase):

    def setUp(self):
        # Create two test users
        self.user_a = User.objects.create_user(username='usera', password='password123', email='usera@example.com')
        self.user_b = User.objects.create_user(username='userb', password='password123', email='userb@example.com')
        
        # Get JWT tokens for User A
        login_url = reverse('login')
        response = self.client.post(login_url, {'username': 'usera', 'password': 'password123'})
        self.user_a_token = response.data['access']
        
        # Get JWT tokens for User B
        response = self.client.post(login_url, {'username': 'userb', 'password': 'password123'})
        self.user_b_token = response.data['access']

    def set_auth_header(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_user_registration(self):
        register_url = reverse('register')
        
        # Test successful registration
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'password_confirm': 'newpassword123'
        }
        response = self.client.post(register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'newuser')
        
        # Test password mismatch
        data['password_confirm'] = 'mismatch'
        response = self.client.post(register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_workout_creation_and_listing(self):
        self.set_auth_header(self.user_a_token)
        workout_url = reverse('workout-list')
        
        # Create workout with nested exercises
        data = {
            'date': '2026-08-18',
            'exercises': [
                {'name': 'Bench Press', 'sets': 3, 'reps': 10, 'weight': 40.00},
                {'name': 'Squat', 'sets': 4, 'reps': 8, 'weight': 60.50}
            ]
        }
        
        response = self.client.post(workout_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkoutSession.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)
        
        # List workouts - should see User A's workout
        response = self.client.get(workout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['owner'], 'usera')

        # Switch to User B - should see 0 workouts
        self.set_auth_header(self.user_b_token)
        response = self.client.get(workout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_ownership_security(self):
        # Create a workout for User A
        workout_a = WorkoutSession.objects.create(owner=self.user_a, date='2026-08-18')
        exercise_a = Exercise.objects.create(session=workout_a, name='Deadlift', sets=1, reps=5, weight=100.00)
        
        # User B attempts to view User A's workout
        self.set_auth_header(self.user_b_token)
        detail_url = reverse('workout-detail', kwargs={'pk': workout_a.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Must return 404, not leak info
        
        # User B attempts to edit User A's workout
        response = self.client.patch(detail_url, {'date': '2026-08-19'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # User B attempts to delete User A's workout
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # User B attempts to add an exercise to User A's workout
        exercise_create_url = reverse('workout-exercise-create', kwargs={'workout_id': workout_a.id})
        response = self.client.post(exercise_create_url, {'name': 'Squat', 'sets': 3, 'reps': 10, 'weight': 50.00})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User B attempts to edit User A's exercise
        exercise_detail_url = reverse('exercise-detail', kwargs={'pk': exercise_a.id})
        response = self.client.patch(exercise_detail_url, {'weight': 110.00})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_validation_rules(self):
        self.set_auth_header(self.user_a_token)
        workout = WorkoutSession.objects.create(owner=self.user_a, date='2026-08-18')
        exercise_create_url = reverse('workout-exercise-create', kwargs={'workout_id': workout.id})
        
        # Test negative weight validation
        data = {'name': 'Squat', 'sets': 3, 'reps': 10, 'weight': -5.00}
        response = self.client.post(exercise_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test zero sets validation
        data = {'name': 'Squat', 'sets': 0, 'reps': 10, 'weight': 50.00}
        response = self.client.post(exercise_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test zero reps validation
        data = {'name': 'Squat', 'sets': 3, 'reps': 0, 'weight': 50.00}
        response = self.client.post(exercise_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test empty exercise name validation
        data = {'name': '   ', 'sets': 3, 'reps': 10, 'weight': 50.00}
        response = self.client.post(exercise_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transaction_atomic_rollback(self):
        self.set_auth_header(self.user_a_token)
        workout_url = reverse('workout-list')
        
        # Payload with one valid exercise and one invalid exercise (negative weight)
        data = {
            'date': '2026-08-18',
            'exercises': [
                {'name': 'Valid Movement', 'sets': 3, 'reps': 10, 'weight': 50.00},
                {'name': 'Invalid Movement', 'sets': 3, 'reps': 10, 'weight': -10.00}
            ]
        }
        
        response = self.client.post(workout_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify complete rollback: no workout session or exercises created
        self.assertEqual(WorkoutSession.objects.count(), 0)
        self.assertEqual(Exercise.objects.count(), 0)

    def test_date_validation(self):
        from django.utils import timezone
        from datetime import timedelta

        self.set_auth_header(self.user_a_token)
        workout_url = reverse('workout-list')
        today = timezone.localdate()

        # 1. Today is allowed
        res_today = self.client.post(workout_url, {'date': str(today)}, format='json')
        self.assertEqual(res_today.status_code, status.HTTP_201_CREATED)
        workout_id = res_today.data['id']

        # 2. Previous dates (e.g. 3 days ago, yesterday) are allowed
        past_date = today - timedelta(days=3)
        res_past = self.client.post(workout_url, {'date': str(past_date)}, format='json')
        self.assertEqual(res_past.status_code, status.HTTP_201_CREATED)

        # 3. Future dates (e.g. tomorrow, next week) are rejected with 400 Bad Request
        future_date = today + timedelta(days=1)
        res_future = self.client.post(workout_url, {'date': str(future_date)}, format='json')
        self.assertEqual(res_future.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', res_future.data)

        # 4. Updating an existing workout to a future date is rejected
        detail_url = reverse('workout-detail', kwargs={'pk': workout_id})
        res_edit_future = self.client.patch(detail_url, {'date': str(future_date)}, format='json')
        self.assertEqual(res_edit_future.status_code, status.HTTP_400_BAD_REQUEST)

        # 5. Updating an existing workout to a past date is allowed
        res_edit_past = self.client.patch(detail_url, {'date': str(past_date)}, format='json')
        self.assertEqual(res_edit_past.status_code, status.HTTP_200_OK)
        self.assertEqual(res_edit_past.data['date'], str(past_date))


