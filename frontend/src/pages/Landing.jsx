import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeatureCard from '../components/FeatureCard'

const Landing = ({ user }) => {
  const features = [
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      ),
      title: 'Autonomous Web Navigation',
      description: 'AI agent automatically browses travel sites to find the best deals for you.',
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      title: 'Smart Trip Planner',
      description: 'Breaks user goals into tasks like flight search, hotels, and activities.',
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      ),
      title: 'Cross Platform Aggregation',
      description: 'Collects travel data from multiple travel platforms in one place.',
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
        </svg>
      ),
      title: 'Travel Optimization Engine',
      description: 'Selects best options based on price, rating, and travel time.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-mint/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight">
            TRAVEL AGENT – AUTOMATED TRIP<br />
            PLANNER & BOOKING ASSISTANT
          </h1>
          <p className="text-lg md:text-xl text-secondary mb-6 max-w-3xl mx-auto font-medium">
            AN INTELLIGENT WEB AGENT FOR SMART TRAVEL PLANNING
          </p>
          <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-8 max-w-4xl mx-auto">
            PLAN YOUR ENTIRE TRIP IN SECONDS - WITHOUT SWITCHING<br />
            BETWEEN DOZENS OF WEBSITES
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            LEARN MORE
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Hero Illustration */}
          <div className="mt-16 relative">
            <div className="flex justify-center items-center gap-8">
              {/* Left Decorative Circle */}
              <div className="hidden lg:block relative">
                <div className="w-48 h-48 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-full animate-pulse"></div>
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-accent-purple" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              
              {/* Center Airplane */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-20 scale-110"></div>
                <svg className="w-48 h-48 md:w-64 md:h-64 text-primary relative z-10 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              
              {/* Right Decorative Circle */}
              <div className="hidden lg:block relative">
                <div className="w-48 h-48 bg-gradient-to-br from-accent-mint/20 to-accent-coral/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-accent-mint" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 hidden xl:block">
              <div className="w-16 h-16 bg-accent-coral/30 rounded-2xl rotate-12 animate-bounce"></div>
            </div>
            <div className="absolute bottom-10 right-10 hidden xl:block">
              <div className="w-20 h-20 bg-accent-blue/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">
              Powerful Features
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for the perfect trip, powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 hidden lg:block">
          <div className="w-24 h-24 bg-accent-mint/10 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white/60 backdrop-blur-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-mint/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">
              About TravelAgent
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing travel planning with AI. Our autonomous agents work 24/7 
              to find you the best travel deals, create perfect itineraries, and save you hours 
              of research time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center bg-gradient-to-br from-white to-accent-mint/5 rounded-3xl p-10 shadow-md hover:shadow-xl transition-all duration-300 border border-accent-mint/20">
              <div className="text-5xl font-bold text-accent-mint mb-3">10K+</div>
              <p className="text-gray-600 font-medium text-lg">Trips Planned</p>
            </div>
            <div className="text-center bg-gradient-to-br from-white to-accent-purple/5 rounded-3xl p-10 shadow-md hover:shadow-xl transition-all duration-300 border border-accent-purple/20">
              <div className="text-5xl font-bold text-accent-purple mb-3">97%</div>
              <p className="text-gray-600 font-medium text-lg">Satisfaction Rate</p>
            </div>
            <div className="text-center bg-gradient-to-br from-white to-accent-coral/5 rounded-3xl p-10 shadow-md hover:shadow-xl transition-all duration-300 border border-accent-coral/20">
              <div className="text-5xl font-bold text-accent-coral mb-3">50+</div>
              <p className="text-gray-600 font-medium text-lg">Countries Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent-mint/5 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-mint/10 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Let's Talk</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">
                Get In Touch
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Have questions? We'd love to hear from you and help plan your next adventure.
              </p>
              <a
                href="mailto:support@travelagent.com"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-full text-lg font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
