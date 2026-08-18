// GymTrack Summary & Analytics Calculations

// Parse a "YYYY-MM-DD" string into a Date object at local midnight
export const parseLocalDate = (dateString) => {
  if (!dateString) return new Date();
  if (dateString.includes('T')) {
    const d = new Date(dateString);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

// Format date to a readable form (e.g., "Aug 18")
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format date with custom options (e.g., full weekday, date, year)
export const formatDateDisplay = (dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', options);
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
  const uniqueDates = [...new Set(workouts.map(w => w.date).filter(Boolean))];
  if (uniqueDates.length === 0) return 0;
  
  // Sort dates descending (newest first)
  uniqueDates.sort((a, b) => {
    const da = parseLocalDate(a);
    const db = parseLocalDate(b);
    return db.getTime() - da.getTime();
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const newestWorkoutDate = parseLocalDate(uniqueDates[0]);
  
  // If the newest workout is older than yesterday, the streak is currently 0
  if (newestWorkoutDate.getTime() < yesterday.getTime()) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = parseLocalDate(uniqueDates[i]);
    const next = parseLocalDate(uniqueDates[i + 1]);
    
    // Difference in days
    const diffTime = current.getTime() - next.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // Gap detected: streak ends here
    }
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
