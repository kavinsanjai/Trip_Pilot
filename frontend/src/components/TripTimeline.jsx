const TripTimeline = ({ timeline }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-accent-mint shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 text-accent-mint mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
        Trip Timeline
      </h3>
      <div className="space-y-4">
        {timeline && timeline.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-accent-mint/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">{item.time}</span>
              </div>
            </div>
            <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-6 -ml-6 -mt-2">
              <h4 className="font-semibold text-gray-800">{item.activity}</h4>
              <p className="text-gray-600 text-sm mt-1">{item.location}</p>
              {item.cost && (
                <p className="text-primary font-medium text-sm mt-1">₹{item.cost}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripTimeline
