import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, supabase } from '../services/supabaseClient'
import ChatInput from '../components/ChatInput'
import TripTimeline from '../components/TripTimeline'
import ComparisonTable from '../components/ComparisonTable'
import WeatherAdvice from '../components/WeatherAdvice'
import Checklist from '../components/Checklist'

const Dashboard = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [tripData, setTripData] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState('chat') // 'chat', 'history', 'saved', 'preferences'
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSendMessage = async (message) => {
    // Add user message to chat
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Call backend API
      const response = await fetch('http://localhost:8000/plan-trip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ prompt: message })
      })

      const data = await response.json()
      
      // Add assistant response
      const assistantMessage = { 
        role: 'assistant', 
        content: 'I\'ve planned your trip! Here are the details:',
        tripData: data
      }
      setMessages(prev => [...prev, assistantMessage])
      setTripData(data)
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error planning your trip. Please try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background-cream">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <span className="text-xl font-bold text-primary">TravelAgent</span>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setCurrentView('chat')}
              className={`w-full text-left px-4 py-3 rounded-xl ${currentView === 'chat' ? 'bg-accent-mint/10 text-primary' : 'hover:bg-gray-100 text-gray-700'} font-medium`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                <span>Dashboard</span>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('history')}
              className={`w-full text-left px-4 py-3 rounded-xl ${currentView === 'history' ? 'bg-accent-mint/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                <span>Trip History</span>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('saved')}
              className={`w-full text-left px-4 py-3 rounded-xl ${currentView === 'saved' ? 'bg-accent-mint/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                <span>Saved Plans</span>
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('preferences')}
              className={`w-full text-left px-4 py-3 rounded-xl ${currentView === 'preferences' ? 'bg-accent-mint/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
                <span>Preferences</span>
              </div>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 mt-auto">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                <span>Logout</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">AI Travel Planner</h1>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <svg className="w-24 h-24 text-primary mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Plan Your Perfect Trip</h2>
              <p className="text-xl text-gray-600 mb-8">
                Tell me where you want to go, and I'll create the perfect itinerary for you!
              </p>
              <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-accent-mint shadow-sm">
                  <p className="text-gray-700 font-medium">Example:</p>
                  <p className="text-gray-600 text-sm mt-2">"Plan a 1 day trip from Ooty to Coimbatore under ₹10000"</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-accent-purple shadow-sm">
                  <p className="text-gray-700 font-medium">Example:</p>
                  <p className="text-gray-600 text-sm mt-2">"Weekend getaway to Pondicherry for 2 people, budget ₹15000"</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white'} rounded-2xl p-6 shadow-md`}>
                  <p className={`${msg.role === 'user' ? 'text-white' : 'text-gray-800'} leading-relaxed`}>
                    {msg.content}
                  </p>
                  
                  {/* Show trip details if available */}
                  {msg.tripData && (
                    <div className="mt-6 space-y-6">
                      {/* Budget Plan Timeline */}
                      {msg.tripData.budget_plan && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">Budget Plan Timeline</h3>
                          <TripTimeline timeline={msg.tripData.budget_plan.timeline} />
                        </div>
                      )}

                      {/* Comparison Table */}
                      {msg.tripData.comparison_table && (
                        <ComparisonTable data={msg.tripData.comparison_table} />
                      )}

                      {/* Weather Advice */}
                      {msg.tripData.weather_advice && (
                        <WeatherAdvice advice={msg.tripData.weather_advice} />
                      )}

                      {/* Crowd Advice */}
                      {msg.tripData.crowd_advice && (
                        <div className="bg-accent-coral/10 rounded-xl p-4 border-2 border-accent-coral">
                          <h4 className="font-bold text-gray-800 mb-2">Crowd Information</h4>
                          <p className="text-gray-700">{msg.tripData.crowd_advice}</p>
                        </div>
                      )}

                      {/* Checklist */}
                      {msg.tripData.things_required && (
                        <Checklist items={msg.tripData.things_required} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'history' ? (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Trip History</h2>
              <p className="text-gray-600 mb-4">Your past trips will appear here once you start planning!</p>
              {/* Trip history will be implemented next */}
            </div>
          ) : currentView === 'saved' ? (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Saved Plans</h2>
              <p className="text-gray-600 mb-4">Save your favorite trips for future reference!</p>
              {/* Saved plans will be implemented next */}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Travel Preferences</h2>
              <p className="text-gray-600 mb-4">Set your default travel preferences to get personalized recommendations!</p>
              {/* Preferences will be implemented next */}
            </div>
          )}
        </div>

        {/* Chat Input - only show in chat view */}
        {currentView === 'chat' && (
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
