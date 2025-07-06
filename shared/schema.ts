import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // strength, cardio, yoga
  muscleGroups: text("muscle_groups").array(),
  description: text("description"),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  calories: integer("calories"),
  notes: text("notes"),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"), // in lbs
  distance: integer("distance"), // in meters
  duration: integer("duration"), // in seconds
  pace: text("pace"), // e.g., "7:45/mi"
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
}).extend({
  date: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

// Extended types for API responses
export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
};

export type WorkoutStats = {
  totalWorkouts: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  avgDuration: number;
  totalCalories: number;
};
