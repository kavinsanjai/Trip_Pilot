import LoginForm from '../components/LoginForm'

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branded Illustration */}
      <div className="hidden lg:flex lg:w-1/2 grid-bg-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative travel elements */}
        <div className="absolute -left-4 bottom-0 text-[14rem] opacity-30 select-none pointer-events-none leading-none" style={{transform: 'rotate(-20deg)'}}>✈️</div>
        <div className="absolute top-8 right-8 text-[5rem] opacity-40 select-none pointer-events-none">🗺️</div>
        <div className="absolute bottom-12 right-12 text-[4rem] opacity-40 select-none pointer-events-none">🧳</div>

        <div className="text-white text-center relative z-10 max-w-md">
          <div className="text-7xl mb-6">🌍</div>
          <h2 className="text-4xl font-black uppercase mb-3 heading-font">Welcome to Trip Pilot</h2>
          <p className="text-white/50 uppercase text-xs tracking-[0.2em] mb-10">
            Your journey to seamless travel planning starts here
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {[
              { icon: '🤖', label: 'AI-Powered' },
              { icon: '⚡', label: 'Lightning Fast' },
              { icon: '💰', label: 'Best Deals' },
              { icon: '🌐', label: 'Global Coverage' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-xs font-bold uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 grid-bg">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login
