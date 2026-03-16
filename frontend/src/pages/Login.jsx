import Navbar from '../components/Navbar'
import LoginForm from '../components/LoginForm'

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          
          <div className="text-center relative z-10">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Welcome to<br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TRIP PILOT
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Your journey to seamless travel planning starts here
            </p>
            
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-sm font-semibold text-gray-700">AI-Powered Planning</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-sm font-semibold text-gray-700">Lightning Fast</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm font-semibold text-gray-700">Best Deals</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">🌍</div>
                <p className="text-sm font-semibold text-gray-700">Global Coverage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default Login
