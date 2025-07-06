import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Dumbbell, Activity, Heart } from "lucide-react";
import type { Exercise } from "@shared/schema";

interface ExerciseSearchProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export default function ExerciseSearch({ onSelectExercise }: ExerciseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: allExercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: searchResults } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { search: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  const getFilteredExercises = () => {
    const exercises = searchQuery ? searchResults || [] : allExercises || [];
    if (selectedCategory === "all") return exercises;
    return exercises.filter(exercise => exercise.category === selectedCategory);
  };

  const filteredExercises = getFilteredExercises();

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
    <div className="space-y-4">
      {/* Search Input */}
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

      {/* Category Filter */}
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        <Button
          variant={selectedCategory === "strength" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("strength")}
          className={selectedCategory === "strength" ? "bg-primary text-white" : ""}
        >
          <Dumbbell className="w-4 h-4 mr-1" />
          Strength
        </Button>
        <Button
          variant={selectedCategory === "cardio" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("cardio")}
          className={selectedCategory === "cardio" ? "bg-secondary text-white" : ""}
        >
          <Activity className="w-4 h-4 mr-1" />
          Cardio
        </Button>
        <Button
          variant={selectedCategory === "yoga" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("yoga")}
          className={selectedCategory === "yoga" ? "bg-purple-600 text-white" : ""}
        >
          <Heart className="w-4 h-4 mr-1" />
          Yoga
        </Button>
      </div>

      {/* Exercise List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {searchQuery ? "No exercises found" : "No exercises available"}
          </p>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors"
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
                  {exercise.description && (
                    <p className="text-xs text-gray-500 mt-1">{exercise.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectExercise(exercise)}
                className="text-primary hover:text-blue-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
