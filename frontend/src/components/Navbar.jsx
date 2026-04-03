// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navLinks = [
  { label: 'Marketplace', path: '/marketplace', icon: '🛍️' },
  { label: 'Events',      path: '/events',      icon: '🎉' },
  { label: 'Lost & Found',path: '/lost-found',  icon: '🔍' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 shrink-0">
            🎓 <span className="text-gray-900">Campusor</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/post')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  + Post
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropOpen(p => !p)}
                    className="flex items-center gap-2 border border-gray-200 rounded-full pl-2 pr-3 py-1.5 hover:border-indigo-400 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                      {user?.profile_picture
                        ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                        : `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`
                      }
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.first_name}</span>
                    <span className="text-gray-400 text-xs">{dropOpen ? '▴' : '▾'}</span>
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                      <Link to="/dashboard" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        👤 Dashboard
                      </Link>
                      <Link to="/my-posts" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        📋 My Posts
                      </Link>
                      <div className="border-t border-gray-100" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(p => !p)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700">👤 Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600">🚪 Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-indigo-600">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
