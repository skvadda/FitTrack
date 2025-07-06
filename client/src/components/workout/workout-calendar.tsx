import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { WorkoutWithExercises } from "@shared/schema";

export default function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: workouts } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  const getCategoryColor = (categories: string[]) => {
    if (categories.includes("strength")) return "bg-primary";
    if (categories.includes("cardio")) return "bg-secondary";
    if (categories.includes("yoga")) return "bg-purple-600";
    return "bg-accent";
  };

  const getWorkoutsForDate = (date: Date) => {
    if (!workouts) return [];
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthName = currentDate.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  const days = getDaysInMonth();

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Workout Calendar
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-gray-900 min-w-[140px] text-center">
              {monthName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week header */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const dayWorkouts = getWorkoutsForDate(day.date);
            const categories = Array.from(new Set(
              dayWorkouts.flatMap(w => w.exercises.map(e => e.exercise.category))
            ));
            
            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-sm relative hover:bg-gray-50 rounded cursor-pointer ${
                  !day.isCurrentMonth ? "text-gray-400" : "text-gray-900"
                } ${
                  isToday(day.date) && day.isCurrentMonth
                    ? "bg-primary/20 border-2 border-primary font-bold text-primary"
                    : dayWorkouts.length > 0
                    ? `${getCategoryColor(categories)}/10`
                    : ""
                }`}
              >
                <span className={isToday(day.date) && day.isCurrentMonth ? "text-primary" : ""}>
                  {day.date.getDate()}
                </span>
                {dayWorkouts.length > 0 && (
                  <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${getCategoryColor(categories)}`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-gray-600">Strength</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-secondary rounded-full" />
            <span className="text-gray-600">Cardio</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-600 rounded-full" />
            <span className="text-gray-600">Yoga</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-gray-600">Mixed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
