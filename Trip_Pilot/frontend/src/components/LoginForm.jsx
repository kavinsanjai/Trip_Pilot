import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signInWithGoogle } from '../services/supabaseClient'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    const { error } = await signInWithGoogle()
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-sm border-2 border-navy/10 rounded-2xl p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-1">Welcome Back</p>
          <h2 className="text-4xl font-black text-navy uppercase heading-font">Sign In</h2>
          <p className="text-navy/50 text-sm mt-1">Login to continue your journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-navy/70 font-bold text-xs uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-cream border-2 border-navy/15 rounded-xl text-navy placeholder-navy/30 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-navy/70 font-bold text-xs uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream border-2 border-navy/15 rounded-xl text-navy placeholder-navy/30 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-primary hover:text-primary-dark text-xs font-bold uppercase tracking-widest">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-cream py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login →'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy/15"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/80 text-navy/40 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-cream border-2 border-navy/15 text-navy py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login with Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-navy/60 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:text-primary-dark uppercase text-xs tracking-widest">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
