import { lazy, Suspense, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InstallPrompt } from "./components/InstallPrompt";

// Lazy load non-critical routes
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingB = lazy(() => import("./pages/LandingB"));
const PremiumChatWrapper = lazy(() => import("./components/PremiumChatWrapper").then(m => ({ default: m.PremiumChatWrapper })));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="spinner w-10 h-10" />
  </div>
);

/**
 * Smart Landing: shows LandingB when accessed from eugineai.com.br domain,
 * otherwise shows default Landing (dark theme).
 */
function SmartLanding() {
  const useLandingB = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    return host.includes('eugineai.com');
  }, []);

  if (useLandingB) {
    return (
      <Suspense fallback={<PageFallback />}>
        <LandingB />
      </Suspense>
    );
  }

  return <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <PremiumChatWrapper />
          </Suspense>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Landing Page — domain-aware */}
              <Route path="/" element={<SmartLanding />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/landing-b" element={<LandingB />} />
              <Route path="/home" element={<SmartLanding />} />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legal Pages */}
              <Route path="/termos-de-uso" element={<TermsOfUse />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/sobre" element={<About />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/analysis/:gameId" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <InstallPrompt />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
