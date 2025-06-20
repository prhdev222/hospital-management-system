import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PatientManagement from "@/pages/PatientManagement";
import TreatmentPlans from "@/pages/TreatmentPlans";
import LabResults from "@/pages/LabResults";
import Reports from "@/pages/Reports";
import Appointments from "@/pages/Appointments";
import Settings from "@/pages/Settings";
import RoleDemoPage from "@/pages/RoleDemoPage";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";

function Router() {
  const { isAuthenticated, isLoading, login } = useAuth();

  const handleLogin = (role: any) => {
    const roleNames = {
      admin: "ผู้ดูแลระบบ",
      doctor: "แพทย์", 
      nurse: "พยาบาล"
    };
    login(role, roleNames[role as keyof typeof roleNames]);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">กำลังโหลด...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route component={() => <Login onLoginSuccess={handleLogin} />} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/patients" component={PatientManagement} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/treatments" component={TreatmentPlans} />
          <Route path="/lab-results" component={LabResults} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/role-demo" component={RoleDemoPage} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
