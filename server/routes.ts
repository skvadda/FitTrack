import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSchema, insertWorkoutExerciseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let exercises;
      if (search) {
        exercises = await storage.searchExercises(search as string);
      } else if (category) {
        exercises = await storage.getExercisesByCategory(category as string);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(parseInt(req.params.id));
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let workouts;
      if (startDate && endDate) {
        workouts = await storage.getWorkoutsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        const allWorkouts = await storage.getWorkouts();
        // Get full workout details for each
        workouts = await Promise.all(
          allWorkouts.map(async (workout) => {
            const fullWorkout = await storage.getWorkout(workout.id);
            return fullWorkout!;
          })
        );
      }
      
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkout(parseInt(req.params.id));
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.put("/api/workouts/:id", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.partial().parse(req.body);
      const workout = await storage.updateWorkout(parseInt(req.params.id), workoutData);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkout(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Workout exercise routes
  app.post("/api/workout-exercises", async (req, res) => {
    try {
      const workoutExerciseData = insertWorkoutExerciseSchema.parse(req.body);
      const workoutExercise = await storage.addExerciseToWorkout(workoutExerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });

  app.put("/api/workout-exercises/:id", async (req, res) => {
    try {
      const workoutExerciseData = insertWorkoutExerciseSchema.partial().parse(req.body);
      const workoutExercise = await storage.updateWorkoutExercise(parseInt(req.params.id), workoutExerciseData);
      if (!workoutExercise) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      res.json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workout exercise" });
    }
  });

  app.delete("/api/workout-exercises/:id", async (req, res) => {
    try {
      const success = await storage.removeExerciseFromWorkout(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove exercise from workout" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWorkoutStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
