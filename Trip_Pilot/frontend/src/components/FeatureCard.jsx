const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-6 rounded-2xl hover:bg-white/20 hover:border-primary transition-all duration-300 group">
      <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white uppercase mb-2 heading-font">{title}</h3>
      <p className="text-white/55 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard
