import { db } from './firebase';

const sampleExercises = [
  {
    id: 1,
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    description: 'Bodyweight upper body exercise'
  },
  {
    id: 2,
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    description: 'Bodyweight lower body exercise'
  },
  {
    id: 3,
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    description: 'Cardiovascular exercise'
  },
  {
    id: 4,
    name: 'Deadlift',
    category: 'strength',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    description: 'Compound strength exercise'
  },
  {
    id: 5,
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    description: 'Upper body strength exercise'
  },
  {
    id: 6,
    name: 'Cycling',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    description: 'Low-impact cardio exercise'
  },
  {
    id: 7,
    name: 'Yoga Flow',
    category: 'yoga',
    muscleGroups: ['full body'],
    description: 'Flexibility and balance exercise'
  },
  {
    id: 8,
    name: 'Mountain Pose',
    category: 'yoga',
    muscleGroups: ['core', 'legs'],
    description: 'Basic standing yoga pose'
  },
  {
    id: 9,
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full body'],
    description: 'High-intensity full body exercise'
  },
  {
    id: 10,
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    description: 'Core strengthening exercise'
  },
  {
    id: 11,
    name: 'Pull-ups',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    description: 'Upper body pulling exercise'
  },
  {
    id: 12,
    name: 'Lunges',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'calves'],
    description: 'Single-leg strength exercise'
  },
  {
    id: 13,
    name: 'Rowing',
    category: 'cardio',
    muscleGroups: ['back', 'arms', 'legs'],
    description: 'Full-body cardio exercise'
  },
  {
    id: 14,
    name: 'Warrior Pose',
    category: 'yoga',
    muscleGroups: ['legs', 'core'],
    description: 'Standing yoga pose for strength and balance'
  },
  {
    id: 15,
    name: 'Swimming',
    category: 'cardio',
    muscleGroups: ['full body'],
    description: 'Low-impact full-body cardio'
  },
  {
    id: 16,
    name: 'Overhead Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'triceps', 'core'],
    description: 'Shoulder strength exercise'
  }
];

async function seedExercises() {
  console.log('Seeding Firebase with exercise data...');
  
  try {
    const batch = db.batch();
    
    for (const exercise of sampleExercises) {
      const docRef = db.collection('exercises').doc(exercise.id.toString());
      batch.set(docRef, {
        name: exercise.name,
        category: exercise.category,
        muscleGroups: exercise.muscleGroups,
        description: exercise.description
      });
    }
    
    await batch.commit();
    console.log('Successfully seeded Firebase with exercise data!');
  } catch (error) {
    console.error('Error seeding Firebase:', error);
  }
}

seedExercises();