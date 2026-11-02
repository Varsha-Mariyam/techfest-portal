import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Home from './pages/Home.jsx';
import Feedback from './pages/Feedback.jsx';
import Login from './pages/Login.jsx';

// Lazy loading: the Gallery code downloads only when someone opens /gallery
   import Gallery from './pages/Gallery.jsx';
export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="bar">
        <NavLink to="/" className="brand">TechFest <b>2026</b></NavLink>
        <nav aria-label="Main">
          <NavLink to="/">Events</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/feedback">Feedback</NavLink>
          {user
            ? <button className="link" onClick={logout}>Log out ({user.name})</button>
            : <NavLink to="/login">Log in</NavLink>}
        </nav>
      </header>
      <main>
        <Suspense fallback={<p className="note">Loading gallery…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<p className="note">Page not found.</p>} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
