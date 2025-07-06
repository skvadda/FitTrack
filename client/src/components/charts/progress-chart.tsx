import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { WorkoutWithExercises } from "@shared/schema";
import { useState } from "react";

export default function ProgressChart() {
  const [timeframe, setTimeframe] = useState("7");

  const { data: workouts, isLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  const getChartData = () => {
    if (!workouts) return [];

    const days = parseInt(timeframe);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    const data = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === currentDate.toDateString();
      });

      const totalDuration = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const totalCalories = dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);

      data.push({
        date: currentDate.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
        workouts: dayWorkouts.length,
        duration: totalDuration,
        calories: totalCalories,
      });
    }

    return data;
  };

  const chartData = getChartData();
  
  const totalWorkouts = chartData.reduce((sum, day) => sum + day.workouts, 0);
  const totalHours = Math.round(chartData.reduce((sum, day) => sum + day.duration, 0) / 60 * 10) / 10;

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Weekly Progress
          </CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            {/* Progress Chart */}
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="hsl(214, 84%, 54%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(214, 84%, 54%)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-secondary">{totalHours}h</p>
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
