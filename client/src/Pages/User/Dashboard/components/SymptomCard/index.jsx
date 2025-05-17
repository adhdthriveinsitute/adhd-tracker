import { Info, RotateCcw } from "lucide-react"

/**
 * Card component for individual symptom with slider
 * Displays symptom name, category, and severity slider
 */
const SymptomCard = ({ symptom, onChange, entryAlreadySaved }) => {
  const { id, name, category, value, info } = symptom

  const handleReset = () => {
    onChange(0)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className={`inline rounded-full ${value <= 4 ? "text-green-500" : value <= 6 ? "text-orange-300" : "text-red-500"}`}>
              <Info
                className="w-5 h-5 inline"
              />
            </div>
            <h3 className="font-medium text-gray-800">{name}</h3>

          </div>
          <p className="text-xs text-gray-500">{category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{value}</span>
          <button
            disabled={entryAlreadySaved}
            onClick={handleReset}
            title="Reset"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <RotateCcw className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          disabled={entryAlreadySaved}
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider-thumb ${entryAlreadySaved ? 'thumb-gray' : 'thumb-green'
            }`}

          style={{
            background: entryAlreadySaved
              ? `linear-gradient(to right, #6b7280 0%, #6b7280 ${value / 10 * 100}%, #f3f4f6 ${value / 10 * 100}%, #f3f4f6 100%)`
              : `linear-gradient(to right, #00897b 0%, #00897b ${value / 10 * 100}%, #f3f4f6 ${value / 10 * 100}%, #f3f4f6 100%)`,
          }}

        />

        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Not noticeable</span>
          <span>Severe</span>
        </div>
      </div>
    </div>
  )
}

export default SymptomCard
