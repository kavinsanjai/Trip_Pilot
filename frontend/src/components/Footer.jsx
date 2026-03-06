import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <h3 className="text-2xl font-bold">TravelAgent</h3>
            </div>
            <p className="text-white/80">
              Your AI-powered autonomous travel planning assistant.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">QUICK LINKS</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="#about" className="text-white/80 hover:text-white transition-colors">
                About
              </Link>
              <Link to="#contact" className="text-white/80 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">CONTACT</h4>
            <div className="flex flex-col space-y-2 text-white/80">
              <p>Email: support@travelagent.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/80">
          <p>&copy; 2026 TravelAgent - Team Debugging Ducks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
