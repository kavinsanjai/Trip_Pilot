import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <span className="text-2xl font-bold text-primary">TravelAgent</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              HOME
            </Link>
            <Link to="#features" className="text-gray-700 hover:text-primary transition-colors font-medium">
              ABOUT
            </Link>
            <Link to="#contact" className="text-gray-700 hover:text-primary transition-colors font-medium">
              CONTACT US
            </Link>
            <Link to="/agent" className="text-gray-700 hover:text-primary transition-colors">
              AI Agent
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="SEARCH..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <Link
              to="/login"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
