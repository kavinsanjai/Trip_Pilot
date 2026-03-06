import Navbar from '../components/Navbar'
import SignupForm from '../components/SignupForm'

const Signup = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 text-primary">Join TravelAgent Today!</h1>
            <p className="text-lg mb-8 text-gray-700">
              Create your account and start planning your dream trips with our AI-powered assistant.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-mint rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Personalized trip recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Seamless booking experience</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-coral rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
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
