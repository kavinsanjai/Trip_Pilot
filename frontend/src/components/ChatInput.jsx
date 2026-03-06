import { useState } from 'react'

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Plan a 2 day trip from Chennai to Ooty under ₹15000..."
              disabled={disabled}
              className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-primary focus:outline-none text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg">
            <div className="flex items-center space-x-2">
              <span>Send</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
