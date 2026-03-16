import Navbar from '../components/Navbar'
import SignupForm from '../components/SignupForm'

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          
          <div className="max-w-md relative z-10">
            <h1 className="text-5xl font-black text-gray-900 mb-6">
              Join <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TRIP PILOT</span> Today!
            </h1>
            <p className="text-lg mb-8 text-gray-600">
              Create your account and start planning your dream trips with our AI-powered assistant.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="text-2xl">✅</div>
                <span className="text-gray-700 font-medium">Personalized trip recommendations</span>
              </div>
              <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="text-2xl">✅</div>
                <span className="text-gray-700 font-medium">Seamless booking experience</span>
              </div>
              <div className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="text-2xl">✅</div>
                <span className="text-gray-700 font-medium">Save and track your trips</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}

export default Signup
