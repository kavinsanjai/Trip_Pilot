import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">✈️ TravelAgent</h3>
            <p className="text-gray-400">
              Your AI-powered autonomous travel planning assistant.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="#about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link to="#contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="flex flex-col space-y-2 text-gray-400">
              <p>Email: support@travelagent.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2026 TravelAgent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
