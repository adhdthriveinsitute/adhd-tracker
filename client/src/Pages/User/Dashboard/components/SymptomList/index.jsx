import { BiLoaderAlt } from "react-icons/bi"
import SymptomCard from "../SymptomCard"
import { formatSymptomScoresPayload } from "@src/utils"

/**
 * Container component for all symptom cards
 * Groups and renders individual symptom cards
 */
const SymptomList = ({
  symptoms,
  onSymptomChange,
  isSaving,
  handleSaveEntry,
  entryAlreadySaved,
  handleDeleteEntry,
  isDeleting
}) => {
  return (
    <>
      <div className="mt-6 md:max-w-5xl md:pr-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Symptoms</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptoms.map((symptom) => (
            <SymptomCard
              entryAlreadySaved={entryAlreadySaved}
              key={symptom.id}
              symptom={symptom}
              onChange={(value) => onSymptomChange(symptom.id, value)} />
          ))}
        </div>
      </div>

      {/* Save & Delete button */}
      <div className="flex justify-center space-x-4 mt-8 mb-4">
        <button
          onClick={() =>
            entryAlreadySaved
              ? handleDeleteEntry()
              : handleSaveEntry(formatSymptomScoresPayload(symptoms))
          }
          disabled={isSaving || isDeleting}
          className={`!px-8 flex items-center justify-center btn-primary
      ${entryAlreadySaved
              ? "!bg-red-600 !text-white hover:!bg-red-700"
              : ""
            }
      ${isSaving || isDeleting ? "opacity-50 cursor-not-allowed" : ""}
    `}
        >
          {isSaving || isDeleting ? (
            <span className="flex items-center gap-2">
              <BiLoaderAlt className="animate-spin h-4 w-4" />
              {entryAlreadySaved ? "Deleting..." : "Saving..."}
            </span>
          ) : (
            <span>{entryAlreadySaved ? "Delete Entry" : "Save Entry"}</span>
          )}
        </button>
      </div>




    </>
  )
}

export default SymptomList
