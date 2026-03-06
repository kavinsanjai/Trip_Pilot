import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">✈️ TravelAgent</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="#features" className="text-gray-700 hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="#about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link to="#contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <Link
              to="/login"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
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
