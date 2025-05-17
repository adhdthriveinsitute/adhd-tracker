import BasePopup from "@src/Components/UI/BasePopup";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import TextField from "@src/Components/FormikFields/TextField";
import { Formik, Form } from "formik";
import SymptomCard from "./SymptomCard";
import { SYMPTOM_CATEGORIES } from "@src/constants";


const SymptomManager = ({
    symptoms,
    editSymptom,
    setEditSymptom,
    newSymptom,
    setNewSymptom,
    handleAddSymptom,
    handleDeleteSymptom,
    handleSaveEdit
}) => {

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6 bg-white px-6 py-10 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a New Symptom</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Symptom Name</label>
                        <input
                            type="text"
                            value={newSymptom.name}
                            onChange={(e) =>
                                setNewSymptom({ ...newSymptom, name: e.target.value })
                            }
                            placeholder="e.g. Headache"
                            className="input-field"
                        />
                    </div>
                    <div className="flex flex-col">


                        <Dropdown
                            options={SYMPTOM_CATEGORIES}
                            label_text={"Symptom Category"}
                            placeholder="Select Category"
                            disableFormik
                            value={newSymptom.category}
                            onChange={(value) => setNewSymptom(prev => ({ ...prev, category: value }))}
                        />

                    </div>
                </div>

                <div className="btn-container !pt-8">
                    <button
                        onClick={handleAddSymptom}
                        className="btn-primary !px-4 !py-3"
                    >
                        Add Symptom
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Symptom List</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {symptoms.map((symptom) => (
                    <SymptomCard
                        key={symptom.id}
                        setEditSymptom={setEditSymptom}
                        handleDeleteSymptom={handleDeleteSymptom}
                        symptom={symptom}
                    />
                ))}
            </div>

            {/* Popup for Editing */}
            <BasePopup title="Edit Symptom" show={!!editSymptom} onClose={() => setEditSymptom(null)}>
                {editSymptom && (
                    <Formik
                        initialValues={{
                            name: editSymptom.name,
                            category: editSymptom.category,
                        }}
                        onSubmit={handleSaveEdit}
                    >
                        <Form className="space-y-4">
                            <TextField field="name" label_text="Symptom Name" placeholder="Enter name" />
                            <Dropdown
                                field="category"
                                label_text="Category"
                                options={SYMPTOM_CATEGORIES}
                                placeholder="Select category"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                                    onClick={() => setEditSymptom(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-5 py-2 text-white rounded-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </Form>
                    </Formik>
                )}
            </BasePopup>
        </div>
    );
};

export default SymptomManager;
