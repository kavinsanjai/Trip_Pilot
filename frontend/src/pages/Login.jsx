import LoginForm from '../components/LoginForm'

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="text-8xl mb-8">✈️ 🌏</div>
          <h2 className="text-4xl font-bold mb-4">Welcome to TravelAgent</h2>
          <p className="text-xl opacity-90">
            Your journey to seamless travel planning starts here
          </p>
          <div className="mt-12 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-sm">AI-Powered Planning</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm">Lightning Fast</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm">Best Deals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">🌐</div>
              <p className="text-sm">Global Coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login
