import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Search, Plus, Clock, Target, Calendar, Dumbbell, Activity, Heart } from "lucide-react";
import type { Exercise, InsertWorkout, InsertWorkoutExercise } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ExerciseSearch from "@/components/workout/exercise-search";

interface WorkoutExerciseData {
  exercise: Exercise;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
  pace?: string;
}

export default function LogWorkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutCalories, setWorkoutCalories] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExerciseData[]>([]);

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: InsertWorkout) => {
      const response = await apiRequest("POST", "/api/workouts", workoutData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Workout logged successfully!",
        description: "Your workout has been saved.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error logging workout",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addExerciseToWorkoutMutation = useMutation({
    mutationFn: async (exerciseData: InsertWorkoutExercise) => {
      const response = await apiRequest("POST", "/api/workout-exercises", exerciseData);
      return response.json();
    },
  });

  const handleAddExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find(e => e.exercise.id === exercise.id);
    if (!exists) {
      setSelectedExercises([...selectedExercises, { exercise }]);
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(selectedExercises.filter(e => e.exercise.id !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId: number, field: string, value: any) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.exercise.id === exerciseId 
        ? { ...e, [field]: value }
        : e
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutName.trim()) {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout.",
        variant: "destructive",
      });
      return;
    }

    try {
      const workoutData: InsertWorkout = {
        name: workoutName,
        date: new Date(workoutDate),
        duration: workoutDuration ? parseInt(workoutDuration) : undefined,
        calories: workoutCalories ? parseInt(workoutCalories) : undefined,
        notes: workoutNotes || undefined,
      };

      const workout = await createWorkoutMutation.mutateAsync(workoutData);

      // Add exercises to the workout
      for (const exerciseData of selectedExercises) {
        const workoutExerciseData: InsertWorkoutExercise = {
          workoutId: workout.id,
          exerciseId: exerciseData.exercise.id,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          weight: exerciseData.weight,
          distance: exerciseData.distance,
          duration: exerciseData.duration,
          pace: exerciseData.pace,
        };
        await addExerciseToWorkoutMutation.mutateAsync(workoutExerciseData);
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return <Dumbbell className="w-4 h-4" />;
      case "cardio": return <Activity className="w-4 h-4" />;
      case "yoga": return <Heart className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strength": return "text-primary bg-primary/10";
      case "cardio": return "text-secondary bg-secondary/10";
      case "yoga": return "text-purple-600 bg-purple-100";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Log Workout</h2>
            <p className="text-gray-600 mt-1">Track your exercises and progress</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
          >
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Workout Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Workout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Workout Name *</Label>
                <Input
                  id="name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Morning Strength Training"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  placeholder="45"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories Burned</Label>
                <Input
                  id="calories"
                  type="number"
                  value={workoutCalories}
                  onChange={(e) => setWorkoutCalories(e.target.value)}
                  placeholder="300"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did the workout feel? Any observations?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercise Search and Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Add Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExerciseSearch onSelectExercise={handleAddExercise} />
          </CardContent>
        </Card>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Selected Exercises ({selectedExercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExercises.map((exerciseData) => (
                <div key={exerciseData.exercise.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(exerciseData.exercise.category)}`}>
                        {getCategoryIcon(exerciseData.exercise.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{exerciseData.exercise.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {exerciseData.exercise.category}
                          </Badge>
                          <p className="text-sm text-gray-600">
                            {exerciseData.exercise.muscleGroups?.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(exerciseData.exercise.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Exercise-specific inputs */}
                  {exerciseData.exercise.category === "strength" && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`sets-${exerciseData.exercise.id}`}>Sets</Label>
                        <Input
                          id={`sets-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.sets || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "sets", parseInt(e.target.value) || undefined)}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reps-${exerciseData.exercise.id}`}>Reps</Label>
                        <Input
                          id={`reps-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.reps || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "reps", parseInt(e.target.value) || undefined)}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`weight-${exerciseData.exercise.id}`}>Weight (lbs)</Label>
                        <Input
                          id={`weight-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.weight || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "weight", parseInt(e.target.value) || undefined)}
                          placeholder="135"
                        />
                      </div>
                    </div>
                  )}

                  {exerciseData.exercise.category === "cardio" && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`distance-${exerciseData.exercise.id}`}>Distance (meters)</Label>
                        <Input
                          id={`distance-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.distance || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "distance", parseInt(e.target.value) || undefined)}
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`duration-${exerciseData.exercise.id}`}>Duration (seconds)</Label>
                        <Input
                          id={`duration-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.duration || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "duration", parseInt(e.target.value) || undefined)}
                          placeholder="1800"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pace-${exerciseData.exercise.id}`}>Pace</Label>
                        <Input
                          id={`pace-${exerciseData.exercise.id}`}
                          value={exerciseData.pace || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "pace", e.target.value || undefined)}
                          placeholder="7:30/mi"
                        />
                      </div>
                    </div>
                  )}

                  {exerciseData.exercise.category === "yoga" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`duration-${exerciseData.exercise.id}`}>Duration (minutes)</Label>
                        <Input
                          id={`duration-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.duration ? Math.round(exerciseData.duration / 60) : ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "duration", (parseInt(e.target.value) || 0) * 60)}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sets-${exerciseData.exercise.id}`}>Sets/Rounds</Label>
                        <Input
                          id={`sets-${exerciseData.exercise.id}`}
                          type="number"
                          value={exerciseData.sets || ""}
                          onChange={(e) => handleUpdateExercise(exerciseData.exercise.id, "sets", parseInt(e.target.value) || undefined)}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {workoutName.trim() && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-800 text-center">
                Ready to save! Click the "Save Workout" button below to save your workout.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 mt-8 pb-8 border-t pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setLocation("/")}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createWorkoutMutation.isPending || !workoutName.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg font-semibold shadow-lg"
          >
            {createWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
          </Button>
        </div>
      </form>
    </div>
  );
}
