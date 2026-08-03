// import React from 'react';
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { Admin } from './pages/Admin';
// import { Home } from './pages/Home';

// export function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/admin" element={<Admin />} />
//       </Routes>
//     </BrowserRouter>);

// }

import { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Admin } from './pages/Admin';
import { Careers } from './pages/Careers';
import { Home } from './pages/Home';
import { SplashScreen } from './components/SplashScreen';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';

function AppContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();

  // Check if we should open the dialog from navigation state
  if (location.state?.openDialog) {
    setIsDialogOpen(true);
    // Clear the state to prevent reopening
    window.history.replaceState({}, document.title, location.pathname);
  }

  return (
    <Routes>
      <Route path="/" element={<Home isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/careers" element={<Careers />} />
    </Routes>
  );
}

export function App() {
  // Play sad background music on loop throughout the app
  // Music starts muted immediately, then fades in after 1 second
  useBackgroundMusic('/crymale.mp3', 0.3, 1000);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
      <SplashScreen />
      <AppContent />
    </BrowserRouter>);

}