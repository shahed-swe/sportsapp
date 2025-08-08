import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";
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
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";
import { AIChatWidget } from "@/components/ai-chat-widget";

// Component to handle root route logic
function LandingPageOrHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-800">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // If user is logged in, show home page, otherwise show landing page
  return user ? <HomePage /> : <LandingPage />;
}

function Router() {
  const [location] = useLocation();
  const shouldShowAIChat = location !== "/landing" && location !== "/";

  return (
    <div>
      <Switch>
        {/* Default landing page route */}
        <Route path="/" component={LandingPageOrHome} />
        <ProtectedRoute path="/home" component={HomePage} />
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
      {shouldShowAIChat && <AIChatWidget />}
    </div>
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
