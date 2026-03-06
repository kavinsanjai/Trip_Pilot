import { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <nav className="grid-bg border-b-2 border-navy/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-black text-navy uppercase tracking-widest heading-font">
              🦆 Trip Pilot
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-navy/70 hover:text-navy font-bold text-xs uppercase tracking-widest transition-colors">
              Home
            </Link>
            <a href="#features" className="text-navy/70 hover:text-navy font-bold text-xs uppercase tracking-widest transition-colors">
              Features
            </a>
            <a href="#about" className="text-navy/70 hover:text-navy font-bold text-xs uppercase tracking-widest transition-colors">
              About
            </a>
            <a href="#contact" className="text-navy/70 hover:text-navy font-bold text-xs uppercase tracking-widest transition-colors">
              Contact Us
            </a>
          </div>

          {/* Search + Auth Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white/70 border border-navy/20 rounded-full px-4 py-2 gap-2">
              <svg className="w-3.5 h-3.5 text-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs text-navy placeholder-navy/40 outline-none w-24"
              />
            </div>
            <Link
              to="/login"
              className="text-navy font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-navy text-cream px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
