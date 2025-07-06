import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, Dumbbell, Activity, Heart, Edit, Trash2 } from "lucide-react";
import type { WorkoutWithExercises } from "@shared/schema";
import WorkoutCalendar from "@/components/workout/workout-calendar";

export default function History() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { data: workouts, isLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const groupWorkoutsByDate = (workouts: WorkoutWithExercises[]) => {
    const grouped: { [key: string]: WorkoutWithExercises[] } = {};
    
    workouts.forEach(workout => {
      const dateKey = new Date(workout.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(workout);
    });

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const groupedWorkouts = workouts ? groupWorkoutsByDate(workouts) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Workout History</h2>
        <p className="text-gray-600 mt-1">View and manage your past workouts</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="xl:col-span-1">
          <WorkoutCalendar />
        </div>

        {/* Workout List */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ))}
                </div>
              ) : groupedWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No workouts recorded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start tracking your fitness journey!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedWorkouts.map(([dateKey, dayWorkouts]) => (
                    <div key={dateKey}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {formatDate(new Date(dateKey))}
                      </h3>
                      <div className="space-y-3">
                        {dayWorkouts.map((workout) => (
                          <Card key={workout.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      {workout.duration && (
                                        <span className="flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {workout.duration} min
                                        </span>
                                      )}
                                      {workout.calories && (
                                        <span className="flex items-center">
                                          <Target className="w-3 h-3 mr-1" />
                                          {workout.calories} cal
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {workout.exercises.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                      <p className="text-sm font-medium text-gray-700">Exercises:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {workout.exercises.map((we) => (
                                          <div key={we.id} className="flex items-center space-x-2">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center ${getCategoryColor(we.exercise.category)}`}>
                                              {getCategoryIcon(we.exercise.category)}
                                            </div>
                                            <span className="text-sm text-gray-700">{we.exercise.name}</span>
                                            {we.sets && we.reps && (
                                              <Badge variant="outline" className="text-xs">
                                                {we.sets}x{we.reps}
                                              </Badge>
                                            )}
                                            {we.weight && (
                                              <Badge variant="outline" className="text-xs">
                                                {we.weight}lbs
                                              </Badge>
                                            )}
                                            {we.distance && (
                                              <Badge variant="outline" className="text-xs">
                                                {(we.distance / 1000).toFixed(1)}km
                                              </Badge>
                                            )}
                                            {we.pace && (
                                              <Badge variant="outline" className="text-xs">
                                                {we.pace}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {workout.notes && (
                                    <p className="text-sm text-gray-600 italic">"{workout.notes}"</p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
