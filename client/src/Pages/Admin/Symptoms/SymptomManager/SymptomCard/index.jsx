import { Pencil, Trash2 } from "lucide-react";

function SymptomCard({ symptom, setEditSymptom, handleDeleteSymptom }) {
    return (
        <div
            key={symptom.id}
            className="bg-gray-100 rounded-2xl border border-gray-300 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col space-y-1">
                    <span className="text-lg font-semibold text-gray-800">
                        {symptom.name}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                        {symptom.category}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                        onClick={() => setEditSymptom(symptom)}
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteSymptom(symptom.id)}
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SymptomCard;
