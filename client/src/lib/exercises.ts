import type { Exercise } from "@shared/schema";

export const exerciseCategories = {
  strength: "Strength Training",
  cardio: "Cardiovascular",
  yoga: "Yoga & Flexibility",
} as const;

export const muscleGroups = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "full body",
] as const;

export const getExerciseIcon = (category: string) => {
  switch (category) {
    case "strength":
      return "dumbbell";
    case "cardio":
      return "activity";
    case "yoga":
      return "heart";
    default:
      return "dumbbell";
  }
};

export const getExerciseColor = (category: string) => {
  switch (category) {
    case "strength":
      return {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary",
      };
    case "cardio":
      return {
        bg: "bg-secondary/10",
        text: "text-secondary",
        border: "border-secondary",
      };
    case "yoga":
      return {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-500",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-300",
      };
  }
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    return `${meters}m`;
  }
};

export const formatWeight = (pounds: number): string => {
  return `${pounds}lbs`;
};

export const formatPace = (pace: string): string => {
  return pace; // Already formatted (e.g., "7:30/mi")
};
