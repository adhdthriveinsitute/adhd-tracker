/**
 * Card displaying the total symptom score and severity level
 */
const SymptomScoreCard = ({ score }) => {
  // Determine severity level based on score
  const getSeverityLevel = (score) => {
    if (score <= 30) return { level: "Fair", color: "bg-green-100 text-green-600" }
    if (score <= 50) return { level: "Moderate", color: "bg-orange-100 text-orange-600" }
    if (score <= 80) return { level: "Major", color: "bg-pink-100 text-pink-600" }
    return { level: "Severe", color: "bg-red-100 text-red-600" }
  }

  const { level, color } = getSeverityLevel(score)

  // Severity ranges for the legend
  const severityRanges = [
    { range: "0-30", level: "Fair", color: "bg-green-100 text-green-600" },
    { range: "31-50", level: "Moderate", color: "bg-orange-100 text-orange-600" },
    { range: "51-80", level: "Major", color: "bg-pink-100 text-pink-600" },
    { range: ">80", level: "Severe", color: "bg-red-100 text-red-600" },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h2 className="font-medium text-gray-800 mb-4">Symptom Total Score Card</h2>

      <div className="flex flex-col items-center mb-4">
        <div className="text-4xl font-bold text-gray-800 mb-1">{score}</div>
        <div className="text-sm text-gray-500">Total Score</div>
        <div className={`mt-2 px-3 py-1 rounded-md text-sm ${color}`}>{level}</div>
      </div>

      <div className="space-y-2">
        {severityRanges.map(({ range, level, color }) => (
          <div key={range} className="flex justify-between items-center text-sm">
            <div className="text-gray-600">{range}</div>
            <div className={`px-2 py-0.5 rounded ${color}`}>{level}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SymptomScoreCard
