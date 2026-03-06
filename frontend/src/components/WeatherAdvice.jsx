const WeatherAdvice = ({ advice }) => {
  if (!advice) return null

  return (
    <div className="bg-white rounded-2xl border-2 border-accent-blue shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 text-accent-blue mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
        </svg>
        Weather Forecast
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-accent-blue/10 rounded-xl p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Temperature</p>
          <p className="text-2xl font-bold text-gray-800">
            {advice.temperature || 'N/A'}
          </p>
        </div>
        <div className="bg-accent-blue/10 rounded-xl p-4">
          <p className="text-gray-600 text-sm font-medium mb-1">Conditions</p>
          <p className="text-2xl font-bold text-gray-800">
            {advice.conditions || 'N/A'}
          </p>
        </div>
      </div>
      {advice.recommendation && (
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-gray-700">
            <span className="font-semibold">Recommendation:</span> {advice.recommendation}
          </p>
        </div>
      )}
    </div>
  )
}

export default WeatherAdvice
