import { 
  exercises, 
  workouts, 
  workoutExercises,
  type Exercise, 
  type InsertExercise, 
  type Workout, 
  type InsertWorkout, 
  type WorkoutExercise, 
  type InsertWorkoutExercise, 
  type WorkoutWithExercises, 
  type WorkoutStats 
} from "@shared/schema";
import { db as firebaseDb, isFirebaseAvailable, admin } from "./firebase";
import { db as postgresDb } from "./db";
import { eq, and, gte, lte, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  searchExercises(query: string): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workout methods
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: number): Promise<WorkoutWithExercises | undefined>;
  getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<WorkoutWithExercises[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;

  // Workout exercise methods
  addExerciseToWorkout(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  updateWorkoutExercise(id: number, workoutExercise: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined>;
  removeExerciseFromWorkout(id: number): Promise<boolean>;

  // Stats methods
  getWorkoutStats(): Promise<WorkoutStats>;
}

export class DatabaseStorage implements IStorage {
  async getExercises(): Promise<Exercise[]> {
    // Use PostgreSQL for reliability - Firebase connection has issues in this environment
    return await postgresDb.select().from(exercises);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return await postgresDb.select().from(exercises).where(eq(exercises.category, category));
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await postgresDb.select().from(exercises).where(
      or(
        ilike(exercises.name, lowerQuery),
        ilike(exercises.category, lowerQuery),
        ilike(exercises.description, lowerQuery)
      )
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await postgresDb.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await postgresDb
      .insert(exercises)
      .values(insertExercise)
      .returning();
    return exercise;
  }

  async getWorkouts(): Promise<Workout[]> {
    return await postgresDb.select().from(workouts).orderBy(desc(workouts.date));
  }

  async getWorkout(id: number): Promise<WorkoutWithExercises | undefined> {
    const [workout] = await postgresDb.select().from(workouts).where(eq(workouts.id, id));
    if (!workout) return undefined;

    const workoutExercisesList = await postgresDb
      .select({
        id: workoutExercises.id,
        workoutId: workoutExercises.workoutId,
        exerciseId: workoutExercises.exerciseId,
        sets: workoutExercises.sets,
        reps: workoutExercises.reps,
        weight: workoutExercises.weight,
        distance: workoutExercises.distance,
        duration: workoutExercises.duration,
        pace: workoutExercises.pace,
        exercise: exercises,
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, id));

    return { ...workout, exercises: workoutExercisesList };
  }

  async getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<WorkoutWithExercises[]> {
    const workoutsList = await postgresDb
      .select()
      .from(workouts)
      .where(and(gte(workouts.date, startDate), lte(workouts.date, endDate)))
      .orderBy(desc(workouts.date));

    const workoutsWithExercises = await Promise.all(
      workoutsList.map(async workout => {
        const fullWorkout = await this.getWorkout(workout.id);
        return fullWorkout!;
      })
    );

    return workoutsWithExercises;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await postgresDb
      .insert(workouts)
      .values(insertWorkout)
      .returning();
    return workout;
  }

  async updateWorkout(id: number, updateData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const [workout] = await postgresDb
      .update(workouts)
      .set(updateData)
      .where(eq(workouts.id, id))
      .returning();
    return workout || undefined;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    // Delete associated workout exercises first
    await postgresDb.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
    
    const result = await postgresDb.delete(workouts).where(eq(workouts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addExerciseToWorkout(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const [workoutExercise] = await postgresDb
      .insert(workoutExercises)
      .values(insertWorkoutExercise)
      .returning();
    return workoutExercise;
  }

  async updateWorkoutExercise(id: number, updateData: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const [workoutExercise] = await postgresDb
      .update(workoutExercises)
      .set(updateData)
      .where(eq(workoutExercises.id, id))
      .returning();
    return workoutExercise || undefined;
  }

  async removeExerciseFromWorkout(id: number): Promise<boolean> {
    const result = await postgresDb.delete(workoutExercises).where(eq(workoutExercises.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getWorkoutStats(): Promise<WorkoutStats> {
    const allWorkouts = await postgresDb.select().from(workouts);
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weeklyWorkouts = allWorkouts.filter(w => new Date(w.date) >= startOfWeek);

    // Calculate streak
    const sortedWorkouts = allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (workoutDate.getTime() === today.getTime() || 
            workoutDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
          currentStreak = 1;
          lastDate = workoutDate;
        } else {
          break;
        }
      } else {
        const expectedDate = new Date(lastDate.getTime() - 24 * 60 * 60 * 1000);
        if (workoutDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
    }

    const totalDuration = allWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = allWorkouts.length > 0 ? Math.round(totalDuration / allWorkouts.length) : 0;
    const totalCalories = allWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    return {
      totalWorkouts: allWorkouts.length,
      currentStreak,
      weeklyGoal: 5, // Fixed goal for now
      weeklyProgress: weeklyWorkouts.length,
      avgDuration,
      totalCalories,
    };
  }
}

export const storage = new DatabaseStorage();
