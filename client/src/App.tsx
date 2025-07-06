import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import Dashboard from "@/pages/dashboard";
import LogWorkout from "@/pages/log-workout";
import History from "@/pages/history";
import Progress from "@/pages/progress";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/layout/navigation";
import MobileHeader from "@/components/layout/mobile-header";
import { Skeleton } from "@/components/ui/skeleton";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <Navigation />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/log-workout" component={LogWorkout} />
          <Route path="/history" component={History} />
          <Route path="/progress" component={Progress} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-gray-600">Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
