import SignupForm from '../components/SignupForm'

const Signup = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branded Illustration */}
      <div className="hidden lg:flex lg:w-1/2 grid-bg-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-4 bottom-0 text-[14rem] opacity-30 select-none pointer-events-none leading-none" style={{transform: 'rotate(-20deg)'}}>✈️</div>
        <div className="absolute top-10 right-10 text-[4rem] opacity-40 select-none pointer-events-none">🌍</div>
        <div className="absolute bottom-14 right-8 text-[3.5rem] opacity-40 select-none pointer-events-none">🏔️</div>

        <div className="text-white max-w-md relative z-10">
          <div className="text-6xl mb-6">🐥</div>
          <h1 className="text-4xl font-black uppercase mb-4 heading-font">Join Trip Pilot Today!</h1>
          <p className="text-white/50 text-sm uppercase tracking-widest mb-8">
            Create your account and start planning your dream trips with our AI-powered assistant.
          </p>
          <div className="space-y-3">
            {[
              'Personalized trip recommendations',
              'Seamless booking experience',
              'Save and track your trips',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/30 border border-primary/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 grid-bg">
        <SignupForm />
      </div>
    </div>
  )
}

export default Signup
