import { useState } from 'react'

const Checklist = ({ items }) => {
  const [checkedItems, setCheckedItems] = useState({})

  const handleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  if (!items || items.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border-2 border-accent-coral shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 text-accent-coral mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM19.79 10.22C19.92 10.79 20 11.39 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c.61 0 1.21.08 1.78.21l1.44-1.44C14.43 2.26 13.25 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.25-.26-2.43-.76-3.5l-1.45 1.44z"/>
        </svg>
        Things to Pack
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => handleCheck(index)}
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
              checkedItems[index] 
                ? 'bg-accent-coral border-accent-coral' 
                : 'border-gray-300'
            }`}>
              {checkedItems[index] && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </div>
            <span className={`text-gray-700 ${checkedItems[index] ? 'line-through text-gray-400' : ''}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Checklist
