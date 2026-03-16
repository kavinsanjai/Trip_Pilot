import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../services/supabaseClient'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-4xl">🦆</span>
            <span className="text-2xl font-bold text-gray-800">TRIP PILOT</span>
          </Link>

          {/* Navigation Links - Left Side */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm tracking-wide">
              HOME
            </Link>
            <Link to="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm tracking-wide">
              FEATURES
            </Link>
            <Link to="#about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm tracking-wide">
              ABOUT
            </Link>
            <Link to="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm tracking-wide">
              CONTACT US
            </Link>
            {user && (
              <Link to="/agent" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm tracking-wide">
                AI AGENT
              </Link>
            )}
          </div>

          {/* Search Bar - Center */}
          <div className="hidden xl:flex relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-sm"
            />
          </div>

          {/* Login/Signup Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-800 text-white px-6 py-2 hover:bg-gray-700 transition-all duration-300 font-medium text-sm"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm px-4 py-2"
                >
                  LOGIN
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-800 text-white px-6 py-2 hover:bg-gray-700 transition-all duration-300 font-medium text-sm"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
