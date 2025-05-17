import SymptomManager from "./SymptomManager"
import { useEffect, useState } from "react";
import { Axios } from "@src/api";
import {
  ErrorNotification,
  generateSymptomIdFromName,
  SuccessNotification
} from "@src/utils";

function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [editSymptom, setEditSymptom] = useState(null);
  const [newSymptom, setNewSymptom] = useState({ name: "", category: "" });

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const res = await Axios.get("/symptoms");
      console.log(res.data.symptoms)
      setSymptoms(res.data.symptoms);
    } catch (error) {
      ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptoms.');
      throw error.response ? error : new Error("Something went wrong");
    }
  };




  const handleAddSymptom = async () => {
    if (!newSymptom.name || !newSymptom.category) return;

    const id = generateSymptomIdFromName(newSymptom.name);
    if (!id) return;

    const payload = {
      id,
      name: newSymptom.name.trim(),
      category: newSymptom.category,
    };

    try {
      const res = await Axios.post("/symptoms", payload);
      setSymptoms((prev) => [res.data.symptom, ...prev]);
      setNewSymptom({ name: "", category: "" });
      SuccessNotification("Symptom added");
    } catch (error) {
      ErrorNotification(error?.response?.data?.error || 'Failed to add symptom.');
      throw error.response ? error : new Error("Something went wrong");
    }
  };

  const handleDeleteSymptom = async (id) => {
    try {
      await Axios.delete(`/symptoms?symptomId=${id}`);
      setSymptoms((prev) => prev.filter((s) => s.id !== id));
      SuccessNotification("Symptom deleted");
    } catch (error) {
      ErrorNotification(error?.response?.data?.error || 'Failed to delete symptom.');
      throw error.response ? error : new Error("Something went wrong");
    }
  };

  const handleSaveEdit = async (values) => {
    const payload = {
      name: values.name,
      category: values.category,
    };

    try {
      const res = await Axios.put(`/symptoms?symptomId=${editSymptom.id}`, payload);
      setSymptoms((prev) =>
        prev.map((s) =>
          s.id === editSymptom.id ? res.data.symptom : s
        )
      );
      setEditSymptom(null);
      SuccessNotification("Symptom updated");
    } catch (error) {
      ErrorNotification(error?.response?.data?.error || 'Failed to update symptom.');
      throw error.response ? error : new Error("Something went wrong");
    }
  };

  return (
    <div>
      <SymptomManager
        symptoms={symptoms}
        editSymptom={editSymptom}
        setEditSymptom={setEditSymptom}
        newSymptom={newSymptom}
        setNewSymptom={setNewSymptom}
        handleAddSymptom={handleAddSymptom}
        handleDeleteSymptom={handleDeleteSymptom}
        handleSaveEdit={handleSaveEdit}
      />
    </div>
  )
}

export default Symptoms