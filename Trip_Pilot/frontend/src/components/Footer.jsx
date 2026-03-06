import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="grid-bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black uppercase mb-4 heading-font">🐥 Trip Pilot</h3>
            <p className="text-white/50 text-sm">
              Your AI-powered autonomous travel planning assistant. Plan smarter, travel better.
            </p>
            <div className="mt-4 text-xs text-white/30 uppercase tracking-widest">
              Team Debugging Ducks · Intellina 2026
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-light mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-white/50 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <a href="#features" className="text-white/50 hover:text-white transition-colors text-sm">Features</a>
              <a href="#about" className="text-white/50 hover:text-white transition-colors text-sm">About</a>
              <a href="#contact" className="text-white/50 hover:text-white transition-colors text-sm">Contact</a>
              <Link to="/login" className="text-white/50 hover:text-white transition-colors text-sm">Login</Link>
              <Link to="/signup" className="text-white/50 hover:text-white transition-colors text-sm">Sign Up</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-light mb-4">Contact</h4>
            <div className="flex flex-col space-y-2 text-sm text-white/50">
              <span>📧 support@trippilot.ai</span>
              <span>🌐 www.trippilot.ai</span>
              <span>🏫 Coimbatore Institute of Technology</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-xs uppercase tracking-widest">
            © 2026 Trip Pilot · Team Debugging Ducks · Intellina 2026 Web Agent Hackathon
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
