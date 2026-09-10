import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ShaderBackground from './components/ShaderBackground';
import LandingPage from './pages/LandingPage';
import VerifyPage from './pages/VerifyPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';


// Main application component.
export default function App() {
  return (
    // BrowserRouter enables client-side routing.
    <Router>
      {/* Background shader displayed across the application. */}
      <ShaderBackground />

      {/* Main application container with a vertical flex layout. */}
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Navigation bar displayed at the top of the application. */}
        <NavBar />
        
        {/* Main content area that expands to fill available space. */}
        <main className="main-content" style={{ flex: '1 0 auto' }}>
          
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
          </Routes>
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
