import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, Clock, Calendar } from "lucide-react";
import type { WorkoutStats, WorkoutWithExercises } from "@shared/schema";
import ProgressChart from "@/components/charts/progress-chart";
import { useState } from "react";

export default function Progress() {
  const [timeframe, setTimeframe] = useState("7");

  const { data: stats, isLoading: statsLoading } = useQuery<WorkoutStats>({
    queryKey: ["/api/stats"],
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  const getFilteredWorkouts = () => {
    if (!workouts) return [];
    const days = parseInt(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return workouts.filter(w => new Date(w.date) >= cutoffDate);
  };

  const filteredWorkouts = getFilteredWorkouts();

  const getWeightProgress = () => {
    const strengthWorkouts = filteredWorkouts.filter(w => 
      w.exercises.some(e => e.exercise.category === "strength" && e.weight)
    );

    const exerciseWeights: { [key: string]: number[] } = {};
    
    strengthWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.weight && exercise.exercise.category === "strength") {
          if (!exerciseWeights[exercise.exercise.name]) {
            exerciseWeights[exercise.exercise.name] = [];
          }
          exerciseWeights[exercise.exercise.name].push(exercise.weight);
        }
      });
    });

    return Object.entries(exerciseWeights).map(([name, weights]) => ({
      exercise: name,
      maxWeight: Math.max(...weights),
      avgWeight: Math.round(weights.reduce((a, b) => a + b, 0) / weights.length),
      sessions: weights.length,
    })).sort((a, b) => b.maxWeight - a.maxWeight);
  };

  const getPaceProgress = () => {
    const cardioWorkouts = filteredWorkouts.filter(w => 
      w.exercises.some(e => e.exercise.category === "cardio" && e.pace)
    );

    const exercisePaces: { [key: string]: string[] } = {};
    
    cardioWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.pace && exercise.exercise.category === "cardio") {
          if (!exercisePaces[exercise.exercise.name]) {
            exercisePaces[exercise.exercise.name] = [];
          }
          exercisePaces[exercise.exercise.name].push(exercise.pace);
        }
      });
    });

    return Object.entries(exercisePaces).map(([name, paces]) => ({
      exercise: name,
      bestPace: paces[0], // Simplified - would need proper pace comparison
      avgPace: paces[Math.floor(paces.length / 2)], // Simplified average
      sessions: paces.length,
    }));
  };

  const getVolumeStats = () => {
    const totalDistance = filteredWorkouts.reduce((sum, workout) => 
      sum + workout.exercises.reduce((exerciseSum, exercise) => 
        exerciseSum + (exercise.distance || 0), 0
      ), 0
    );

    const totalWeight = filteredWorkouts.reduce((sum, workout) => 
      sum + workout.exercises.reduce((exerciseSum, exercise) => 
        exerciseSum + ((exercise.weight || 0) * (exercise.sets || 0) * (exercise.reps || 0)), 0
      ), 0
    );

    const totalTime = filteredWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);

    return {
      distance: (totalDistance / 1000).toFixed(1), // Convert to km
      weight: totalWeight.toLocaleString(),
      time: Math.floor(totalTime / 60) + "h " + (totalTime % 60) + "m",
    };
  };

  const weightProgress = getWeightProgress();
  const paceProgress = getPaceProgress();
  const volumeStats = getVolumeStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor your fitness improvements over time</p>
      </div>

      {/* Time Frame Selector */}
      <div className="mb-6">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress Chart */}
      <div className="mb-8">
        <ProgressChart />
      </div>

      {/* Detailed Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weight Progression */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Weight Lifted (lbs)</h4>
              <div className="space-y-3">
                {weightProgress.length === 0 ? (
                  <p className="text-gray-500 text-sm">No strength training data</p>
                ) : (
                  weightProgress.slice(0, 3).map((item) => (
                    <div key={item.exercise} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">{item.exercise}</span>
                        <p className="text-xs text-gray-500">{item.sessions} sessions</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{item.maxWeight} lbs</span>
                        <p className="text-xs text-gray-500">max</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Running Pace */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Running Pace</h4>
              <div className="space-y-3">
                {paceProgress.length === 0 ? (
                  <p className="text-gray-500 text-sm">No cardio pace data</p>
                ) : (
                  paceProgress.slice(0, 3).map((item) => (
                    <div key={item.exercise} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">{item.exercise}</span>
                        <p className="text-xs text-gray-500">{item.sessions} sessions</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{item.bestPace}</span>
                        <p className="text-xs text-gray-500">best</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Volume Trends */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Volume Trends</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Distance</span>
                  <span className="font-semibold text-gray-900">{volumeStats.distance} km</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Weight</span>
                  <span className="font-semibold text-gray-900">{volumeStats.weight} lbs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Active Time</span>
                  <span className="font-semibold text-gray-900">{volumeStats.time}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Streak</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.currentStreak || 0} days</p>
                )}
              </div>
              <Target className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Workouts</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalWorkouts || 0}</p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Duration</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.avgDuration || 0} min</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Calories</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalCalories || 0}</p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
