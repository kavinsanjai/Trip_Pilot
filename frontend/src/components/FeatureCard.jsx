const FeatureCard = ({ icon, title, description }) => {
  const borderColors = [
    'border-accent-mint',
    'border-accent-purple',
    'border-accent-coral',
    'border-accent-blue'
  ];
  
  const iconColors = [
    'text-accent-mint',
    'text-accent-purple',
    'text-accent-coral',
    'text-accent-blue'
  ];
  
  const bgGradients = [
    'from-accent-mint/5 to-white',
    'from-accent-purple/5 to-white',
    'from-accent-coral/5 to-white',
    'from-accent-blue/5 to-white'
  ];
  
  // Use index from title length to get consistent but varied colors
  const colorIndex = title.length % borderColors.length;
  const borderColor = borderColors[colorIndex];
  const iconColor = iconColors[colorIndex];
  const bgGradient = bgGradients[colorIndex];
  
  return (
    <div className={`bg-gradient-to-br ${bgGradient} p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${borderColor}`}>
      <div className={`mb-4 ${iconColor}`}>{icon}</div>
      <h3 className="text-xl font-semibold text-primary mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard
