import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ShaderBackground from './components/ShaderBackground';
import LandingPage from './pages/LandingPage';
import VerifyPage from './pages/VerifyPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';

// Scrolls to top on every route change so navigating between pages
// never leaves the user mid-scroll on the new page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Wraps each route's content in a subtle fade/slide-in so page changes
// feel intentional instead of an abrupt swap. Re-keys on pathname so the
// animation replays every navigation. Uses only existing timing/easing,
// no new color tokens.
function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}

// Fallback shown while a lazy-loaded page (if any are added later) is
// fetching — reuses the existing spinner + eyebrow styles.
function PageLoader() {
  return (
    <div className="flex-center flex-col gap-md">
      <span className="spinner-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12" cy="12" r="10"
            stroke="var(--border-color)" strokeWidth="2.5"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="eyebrow">Loading</span>
    </div>
  );
}

// Simple 404 for unmatched routes — reuses .result-box/.warning so it
// matches the existing proof/verification result styling.
function NotFoundPage() {
  return (
    <div className="page-container flex-center">
      <div className="result-box warning max-w-md mx-auto">
        <div className="result-title">Page not found</div>
        <p className="result-desc">
          The transcript you're looking for doesn't exist or has moved.
        </p>
      </div>
    </div>
  );
}

// Main application component.
export default function App() {
  return (
    // BrowserRouter enables client-side routing.
    <Router>
      {/* Background shader displayed across the application. */}
      <ShaderBackground />

      {/* Main application container with a vertical flex layout. */}
      <div className="app-container">

        {/* Navigation bar displayed at the top of the application. */}
        <NavBar />

        {/* Resets scroll position on every navigation. */}
        <ScrollToTop />

        {/* Main content area that expands to fill available space. */}
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <PageTransition>
              {/* Defines the different pages/routes of the application. */}
              <Routes>
                {/* Landing page shown at the root URL. */}
                <Route path="/" element={<LandingPage />} />

                {/* Verification page used to verify scholarship eligibility. */}
                <Route path="/verify" element={<VerifyPage />} />

                {/* Admin page for administrative functionality. */}
                <Route path="/admin" element={<AdminPage />} />

                {/* About page containing information about the application. */}
                <Route path="/about" element={<AboutPage />} />

                {/* Catch-all for unmatched routes. */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </main>

        {/* Footer displayed at the bottom of the application. */}
        <Footer />
      </div>
    </Router>
  );
}

// Wrapper component that provides wallet functionality to the entire application.
export function AppWithProviders() {
  return (
    // WalletProvider makes wallet state and functions available to child components.
    <WalletProvider>
      {/* Render the main application inside the wallet provider. */}
      <App />
    </WalletProvider>
  );
}
