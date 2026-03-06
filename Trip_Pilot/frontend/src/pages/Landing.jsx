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

      {/* ── Hero Section ── */}
      <section className="grid-bg relative overflow-hidden min-h-[90vh] flex items-center py-20 px-4">
        {/* Decorative background travel elements */}
        <div className="absolute -left-8 bottom-0 text-[18rem] opacity-30 select-none pointer-events-none leading-none" style={{transform: 'rotate(-20deg)'}}>✈️</div>
        <div className="absolute right-4 bottom-4 text-[9rem] opacity-40 select-none pointer-events-none">🧳</div>
        <div className="absolute top-12 right-[18%] text-[4rem] opacity-40 select-none pointer-events-none">🗺️</div>
        <div className="absolute top-24 left-[8%] text-[3rem] opacity-40 select-none pointer-events-none">🏝️</div>
        <div className="absolute bottom-24 left-[22%] text-[2.5rem] opacity-40 select-none pointer-events-none">🏔️</div>
        <div className="absolute top-1/3 right-[6%] text-[2.5rem] opacity-40 select-none pointer-events-none">🎒</div>

        <div className="max-w-5xl mx-auto w-full text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-8">
            <span>🌟</span> AI-Powered Travel Planning
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-navy mb-4 uppercase leading-tight heading-font">
            Travel Agent –<br />
            <span className="text-primary">Automated Trip</span><br />
            Planner &amp; Booking Assistant
          </h1>

          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-navy/50 mb-10">
            An Intelligent Web Agent for Smart Travel Planning
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="bg-navy text-cream px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-lg"
            >
              Start Planning →
            </Link>
            <a
              href="#features"
              className="border-2 border-navy text-navy px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-navy hover:text-cream transition-all duration-300"
            >
              Learn More
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '10K+', label: 'Trips Planned' },
              { value: '97%', label: 'Satisfaction' },
              { value: '50+', label: 'Countries' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/60 backdrop-blur-sm border border-navy/10 rounded-2xl p-4">
                <div className="text-3xl font-black text-primary heading-font">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-navy/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 px-4 grid-bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-light text-xs font-bold uppercase tracking-[0.3em] mb-3">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase heading-font">
              Powerful Features
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto mt-4"></div>
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
      </section>

      {/* ── How It Works Section ── */}
      <section id="about" className="py-20 px-4 grid-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-black text-navy uppercase heading-font">
              Plan Your Trip in 3 Steps
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🎯', title: 'Tell Us Your Goal', desc: 'Simply tell us where you want to go and your preferences — dates, budget, vibe.' },
              { step: '02', icon: '🤖', title: 'AI Does the Work', desc: 'Our agent autonomously scours the web for optimal flights, hotels & activities.' },
              { step: '03', icon: '🌴', title: 'Enjoy Your Trip', desc: 'Get a complete itinerary and book everything seamlessly from one dashboard.' },
            ].map((item) => (
              <div key={item.step} className="bg-white/60 border-2 border-navy/10 rounded-2xl p-8 hover:border-primary hover:shadow-xl transition-all duration-300 group">
                <div className="text-xs font-black text-primary/50 uppercase tracking-widest heading-font mb-2">Step {item.step}</div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-black text-navy uppercase heading-font mb-2">{item.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Team badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-navy text-cream px-8 py-4 rounded-2xl">
              <span className="text-2xl">🦆</span>
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-primary-light">Presented by</div>
                <div className="text-base font-black uppercase heading-font">Team Debugging Ducks</div>
                <div className="text-xs text-cream/50 uppercase tracking-widest">Intellina 2026 · Web Agent Hackathon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact / CTA Section ── */}
      <section id="contact" className="py-20 px-4 grid-bg-dark">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-light text-xs font-bold uppercase tracking-[0.3em] mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase heading-font mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/50 text-base mb-10 max-w-xl mx-auto uppercase tracking-widest text-xs">
            Plan your entire trip in seconds — without switching between dozens of websites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-primary text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-primary-dark transition-all duration-300 shadow-lg"
            >
              Get Started Free
            </Link>
            <a
              href="mailto:support@trippilot.ai"
              className="border-2 border-white/40 text-white px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-navy transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing

