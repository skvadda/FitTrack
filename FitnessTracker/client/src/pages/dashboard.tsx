import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { CalendarDays, Target, TrendingUp, Clock, Search, Plus, Dumbbell, Activity, Heart } from "lucide-react";
import type { WorkoutStats, Exercise, WorkoutWithExercises } from "@shared/schema";
import { useState } from "react";
import WorkoutCalendar from "@/components/workout/workout-calendar";
import ProgressChart from "@/components/charts/progress-chart";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("strength");

  const { data: stats, isLoading: statsLoading } = useQuery<WorkoutStats>({
    queryKey: ["/api/stats"],
  });

  const { data: exercises, isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: recentWorkouts, isLoading: workoutsLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: searchResults } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { search: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  const popularExercises = exercises?.slice(0, 3) || [];
  const exercisesToShow = searchQuery ? searchResults || [] : popularExercises;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return <Dumbbell className="w-5 h-5" />;
      case "cardio": return <Activity className="w-5 h-5" />;
      case "yoga": return <Heart className="w-5 h-5" />;
      default: return <Dumbbell className="w-5 h-5" />;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Good morning!</h2>
            <p className="text-gray-600 mt-1">Ready to crush your fitness goals today?</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => setLocation("/log-workout")}
              className="bg-primary text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Streak</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.currentStreak || 0} days</p>
                )}
                <p className="text-secondary text-sm mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Keep it up!
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="text-secondary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Weekly Goal</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.weeklyProgress || 0}/{stats?.weeklyGoal || 5} workouts
                  </p>
                )}
                <p className="text-accent text-sm mt-1">
                  <Target className="w-3 h-3 inline mr-1" />
                  {stats ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) : 0}% complete
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Target className="text-accent text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Workouts</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalWorkouts || 0}</p>
                )}
                <p className="text-primary text-sm mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  This week: {stats?.weeklyProgress || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-primary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Duration</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.avgDuration || 0} min</p>
                )}
                <p className="text-secondary text-sm mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Consistent pace
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Quick Log Workout */}
        <div className="xl:col-span-2">
          <Card className="border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Log Today's Workout</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/log-workout")}
                  className="text-primary hover:text-blue-600"
                >
                  View All Exercises
                </Button>
              </div>

              {/* Exercise Search */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search exercises (e.g., push-ups, running, yoga)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Workout Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSelectedCategory("strength")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    selectedCategory === "strength" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <Dumbbell className={`mx-auto text-2xl mb-2 ${
                    selectedCategory === "strength" ? "text-primary" : "text-gray-600"
                  }`} />
                  <p className={`font-semibold ${
                    selectedCategory === "strength" ? "text-primary" : "text-gray-900"
                  }`}>Strength</p>
                  <p className="text-sm text-gray-600">Weights & Resistance</p>
                </button>
                <button
                  onClick={() => setSelectedCategory("cardio")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    selectedCategory === "cardio" 
                      ? "border-secondary bg-secondary/5" 
                      : "border-gray-200 hover:border-secondary hover:bg-secondary/5"
                  }`}
                >
                  <Activity className={`mx-auto text-2xl mb-2 ${
                    selectedCategory === "cardio" ? "text-secondary" : "text-gray-600"
                  }`} />
                  <p className={`font-semibold ${
                    selectedCategory === "cardio" ? "text-secondary" : "text-gray-900"
                  }`}>Cardio</p>
                  <p className="text-sm text-gray-600">Running, Cycling</p>
                </button>
                <button
                  onClick={() => setSelectedCategory("yoga")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    selectedCategory === "yoga" 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                  }`}
                >
                  <Heart className={`mx-auto text-2xl mb-2 ${
                    selectedCategory === "yoga" ? "text-purple-600" : "text-gray-600"
                  }`} />
                  <p className={`font-semibold ${
                    selectedCategory === "yoga" ? "text-purple-600" : "text-gray-900"
                  }`}>Yoga</p>
                  <p className="text-sm text-gray-600">Flexibility & Balance</p>
                </button>
              </div>

              {/* Quick Exercise List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 mb-3">
                  {searchQuery ? "Search Results" : "Popular Exercises"}
                </h4>
                {exercisesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : exercisesToShow.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {searchQuery ? "No exercises found" : "No exercises available"}
                  </p>
                ) : (
                  exercisesToShow.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(exercise.category)}`}>
                          {getCategoryIcon(exercise.category)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{exercise.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {exercise.category}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              {exercise.muscleGroups?.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <Card className="border-gray-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Workouts completed</span>
                  <span className="font-semibold text-gray-900">
                    {recentWorkouts?.filter(w => 
                      new Date(w.date).toDateString() === new Date().toDateString()
                    ).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time spent</span>
                  <span className="font-semibold text-gray-900">
                    {recentWorkouts?.filter(w => 
                      new Date(w.date).toDateString() === new Date().toDateString()
                    ).reduce((sum, w) => sum + (w.duration || 0), 0) || 0} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Calories burned</span>
                  <span className="font-semibold text-gray-900">
                    {recentWorkouts?.filter(w => 
                      new Date(w.date).toDateString() === new Date().toDateString()
                    ).reduce((sum, w) => sum + (w.calories || 0), 0) || 0}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Goal progress</span>
                    <span className="font-semibold text-secondary">
                      {stats ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ 
                        width: `${stats ? Math.min(100, (stats.weeklyProgress / stats.weeklyGoal) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/history")}
                  className="text-primary hover:text-blue-600"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {workoutsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentWorkouts?.slice(0, 3).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent workouts</p>
                ) : (
                  recentWorkouts?.slice(0, 3).map((workout) => (
                    <div key={workout.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Dumbbell className="text-primary w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{workout.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.date).toLocaleDateString()} • {workout.duration || 0} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{workout.calories || 0} cal</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar and Progress Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WorkoutCalendar />
        <ProgressChart />
      </div>
    </div>
  );
}
