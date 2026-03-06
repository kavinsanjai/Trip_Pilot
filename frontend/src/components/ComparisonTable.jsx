const ComparisonTable = ({ data }) => {
  if (!data) return null

  return (
    <div className="bg-white rounded-2xl border-2 border-accent-purple shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 text-accent-purple mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
        Plan Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Aspect</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold bg-accent-mint/10">Budget Plan</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold bg-accent-blue/10">Comfort Plan</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">Total Cost</td>
              <td className="py-3 px-4 bg-accent-mint/10 text-primary font-bold">
                {data.budget_plan?.total_cost || 'N/A'}
              </td>
              <td className="py-3 px-4 bg-accent-blue/10 text-primary font-bold">
                {data.comfort_plan?.total_cost || 'N/A'}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">Transportation</td>
              <td className="py-3 px-4 bg-accent-mint/10 text-gray-700">
                {data.budget_plan?.transportation || 'N/A'}
              </td>
              <td className="py-3 px-4 bg-accent-blue/10 text-gray-700">
                {data.comfort_plan?.transportation || 'N/A'}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">Food</td>
              <td className="py-3 px-4 bg-accent-mint/10 text-gray-700">
                {data.budget_plan?.food || 'N/A'}
              </td>
              <td className="py-3 px-4 bg-accent-blue/10 text-gray-700">
                {data.comfort_plan?.food || 'N/A'}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">Activities</td>
              <td className="py-3 px-4 bg-accent-mint/10 text-gray-700">
                {data.budget_plan?.activities || 'N/A'}
              </td>
              <td className="py-3 px-4 bg-accent-blue/10 text-gray-700">
                {data.comfort_plan?.activities || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-700">Duration</td>
              <td className="py-3 px-4 bg-accent-mint/10 text-gray-700">
                {data.budget_plan?.duration || 'N/A'}
              </td>
              <td className="py-3 px-4 bg-accent-blue/10 text-gray-700">
                {data.comfort_plan?.duration || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparisonTable
