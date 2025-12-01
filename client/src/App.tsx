import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import BookingPage from "@/pages/booking";
import LeavesPage from "@/pages/leaves";
import ChalanPage from "@/pages/chalan/index";
import ChalanRevisePage from "@/pages/chalan/revise";
import CustomersPage from "@/pages/masters/customers";
import ProjectsPage from "@/pages/masters/projects";
import RoomsPage from "@/pages/masters/rooms";
import EditorsPage from "@/pages/masters/editors";
import ConflictReportPage from "@/pages/reports/conflict";
import BookingReportPage from "@/pages/reports/booking";
import EditorReportPage from "@/pages/reports/editor";
import ChalanReportPage from "@/pages/reports/chalan";
import UserRightsPage from "@/pages/utility/user-rights";
import UsersPage from "@/pages/utility/users";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (location === "/login") {
    if (isAuthenticated) {
      return <Redirect to="/" />;
    }
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/" component={BookingPage} />
              <Route path="/leaves" component={LeavesPage} />
              <Route path="/chalan" component={ChalanPage} />
              <Route path="/chalan/revise" component={ChalanRevisePage} />
              <Route path="/masters/customers" component={CustomersPage} />
              <Route path="/masters/projects" component={ProjectsPage} />
              <Route path="/masters/rooms" component={RoomsPage} />
              <Route path="/masters/editors" component={EditorsPage} />
              <Route path="/reports/conflict" component={ConflictReportPage} />
              <Route path="/reports/booking" component={BookingReportPage} />
              <Route path="/reports/editor" component={EditorReportPage} />
              <Route path="/reports/chalan" component={ChalanReportPage} />
              <Route path="/utility/user-rights" component={UserRightsPage} />
              <Route path="/utility/users" component={UsersPage} />
              <Route component={NotFound} />
            </Switch>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
