import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import "./i18n"; // Initialize i18next
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import AdminLoginPage from "@/pages/admin-login-page";
import UserManagementPage from "@/pages/user-management-page";
import FeedPage from "@/pages/feed-page";
import PostManagementPage from "@/pages/post-management-page";
import UserProfilePage from "@/pages/user-profile-page";
import RedeemPointsPage from "@/pages/redeem-points-page";
import VerificationManagementPage from "@/pages/verification-management-page";
import RedeemManagementPage from "@/pages/redeem-management-page";
import DrillPage from "@/pages/drill-page";
import DrillManagementPage from "@/pages/drill-management-page";
import MessagesPage from "@/pages/messages-page";
import TryoutsPage from "@/pages/tryouts-page";
import TryoutManagementPage from "@/pages/tryout-management-page";
import SportsNewsPage from "@/pages/sports-news-page";
import CricketCoachingPage from "@/pages/cricket-coaching-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/profile/:id" component={UserProfilePage} />
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      <ProtectedRoute path="/redeem-points" component={RedeemPointsPage} />
      <ProtectedRoute path="/drills" component={DrillPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/tryouts" component={TryoutsPage} />
      <ProtectedRoute path="/sports-news" component={SportsNewsPage} />
      <ProtectedRoute path="/cricket-coaching" component={CricketCoachingPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <AdminProtectedRoute path="/admin" component={AdminPage} />
      <AdminProtectedRoute path="/user-management" component={UserManagementPage} />
      <AdminProtectedRoute path="/post-management" component={PostManagementPage} />
      <AdminProtectedRoute path="/verification-management" component={VerificationManagementPage} />
      <AdminProtectedRoute path="/redeem-management" component={RedeemManagementPage} />
      <AdminProtectedRoute path="/drill-management" component={DrillManagementPage} />
      <AdminProtectedRoute path="/tryout-management" component={TryoutManagementPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
