import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeatureCard from '../components/FeatureCard'

const Landing = () => {
  const features = [
    {
      icon: '🤖',
      title: 'Autonomous Web Navigation',
      description: 'AI agent automatically browses travel sites to find the best deals for you.',
    },
    {
      icon: '🗺️',
      title: 'Smart Trip Planner',
      description: 'Breaks user goals into tasks like flight search, hotels, and activities.',
    },
    {
      icon: '🌐',
      title: 'Cross Platform Aggregation',
      description: 'Collects travel data from multiple travel platforms in one place.',
    },
    {
      icon: '⚡',
      title: 'Travel Optimization Engine',
      description: 'Selects best options based on price, rating, and travel time.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Plan Your Entire Trip in Seconds
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            An AI-powered autonomous travel agent that navigates travel websites and generates 
            the best itinerary automatically.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Planning
          </Link>

          {/* Hero Image/Illustration */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-6xl">
                ✈️ 🌍 🏨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for the perfect trip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About TravelAgent
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing travel planning with AI. Our autonomous agents work 24/7 
              to find you the best travel deals, create perfect itineraries, and save you hours 
              of research time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">10K+</div>
              <p className="text-gray-600">Trips Planned</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">97%</div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">50+</div>
              <p className="text-gray-600">Countries Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <a
            href="mailto:support@travelagent.com"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
