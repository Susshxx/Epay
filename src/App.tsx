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

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Admin } from './pages/Admin';
import { Home } from './pages/Home';

export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>);

}