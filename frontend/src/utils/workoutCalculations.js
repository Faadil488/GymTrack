// GymTrack Summary & Analytics Calculations

// Format date to a readable form (e.g., "Aug 18")
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Add timezone offset to prevent shifting dates due to UTC conversion
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  
  return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Calculate total exercises
export const calculateTotalExercises = (workouts) => {
  if (!workouts) return 0;
  return workouts.reduce((total, w) => total + (w.exercises?.length || 0), 0);
};

// Calculate total sets
export const calculateTotalSets = (workouts) => {
  if (!workouts) return 0;
  return workouts.reduce((total, w) => {
    const workoutSets = w.exercises?.reduce((s, ex) => s + (parseInt(ex.sets) || 0), 0) || 0;
    return total + workoutSets;
  }, 0);
};

// Calculate total reps
export const calculateTotalReps = (workouts) => {
  if (!workouts) return 0;
  return workouts.reduce((total, w) => {
    const workoutReps = w.exercises?.reduce((r, ex) => r + ((parseInt(ex.sets) || 0) * (parseInt(ex.reps) || 0)), 0) || 0;
    return total + workoutReps;
  }, 0);
};

// Find heaviest weight and corresponding exercise name
export const calculateHeaviestWeight = (workouts) => {
  if (!workouts || workouts.length === 0) return { weight: 0, exerciseName: 'None' };
  
  let maxWeight = 0;
  let maxExercise = 'None';

  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      const weight = parseFloat(ex.weight) || 0;
      if (weight > maxWeight) {
        maxWeight = weight;
        maxExercise = ex.name;
      }
    });
  });

  return { weight: maxWeight, exerciseName: maxExercise };
};

// Calculate Personal Records for each exercise
export const calculatePersonalRecords = (workouts) => {
  if (!workouts) return [];
  
  const recordsMap = {};

  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      const nameClean = ex.name.trim();
      const weight = parseFloat(ex.weight) || 0;
      const reps = parseInt(ex.reps) || 0;

      if (!recordsMap[nameClean] || weight > recordsMap[nameClean].weight) {
        recordsMap[nameClean] = {
          name: nameClean,
          weight: weight,
          reps: reps,
          date: w.date
        };
      }
    });
  });

  return Object.values(recordsMap).sort((a, b) => b.weight - a.weight);
};

// Calculate active workout streak (consecutive days of training)
export const calculateWorkoutStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return 0;
  
  // Extract and deduplicate dates
  const uniqueDates = [...new Set(workouts.map(w => w.date))];
  
  // Sort dates descending (newest first)
  uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const newestWorkoutDate = new Date(uniqueDates[0]);
  // Account for timezones when parsing date string
  const userTimezoneOffset = newestWorkoutDate.getTimezoneOffset() * 60000;
  const newestLocalWorkoutDate = new Date(newestWorkoutDate.getTime() + userTimezoneOffset);
  newestLocalWorkoutDate.setHours(0, 0, 0, 0);
  
  // If the newest workout is older than yesterday, the streak is currently 0
  if (newestLocalWorkoutDate < yesterday && newestLocalWorkoutDate.getTime() !== today.getTime()) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const currentLocal = new Date(current.getTime() + current.getTimezoneOffset() * 60000);
    currentLocal.setHours(0, 0, 0, 0);
    
    const next = new Date(uniqueDates[i + 1]);
    const nextLocal = new Date(next.getTime() + next.getTimezoneOffset() * 60000);
    nextLocal.setHours(0, 0, 0, 0);
    
    // Difference in days
    const diffTime = Math.abs(currentLocal - nextLocal);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // Gap detected: streak ends here
    }
    // Note: diffDays === 0 (multiple workouts on the same day) is skipped
  }
  
  return streak;
};

// Calculate progress over time for a selected exercise name
export const calculateExerciseProgress = (workouts, exerciseName) => {
  if (!workouts || !exerciseName) return [];

  const progress = [];
  
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      if (ex.name.toLowerCase().trim() === exerciseName.toLowerCase().trim()) {
        progress.push({
          date: w.date,
          dateFormatted: formatDateShort(w.date),
          weight: parseFloat(ex.weight) || 0,
          reps: parseInt(ex.reps) || 0,
          sets: parseInt(ex.sets) || 0
        });
      }
    });
  });

  // Sort by date chronological (oldest first for line chart)
  return progress.sort((a, b) => new Date(a.date) - new Date(b.date));
};
