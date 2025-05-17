import { useSelector } from "react-redux"
import { useState, useEffect } from "react"
// Components
import CalendarPicker from "./components/CalendarPicker"
import SymptomTrendsChart from "./components/SymptomTrendsChart"
import SymptomChangeFromBaselineChart from "./components/SymptomChangeFromBaselineChart"
import SymptomScoreCard from "./components/SymptomScoreCard"
import SymptomList from "./components/SymptomList"
import { format } from "date-fns";

// Utils and data
import { DATE_FORMAT_STRING } from "@src/constants.js"
import { formatDate, calculateTotalScore, ErrorNotification, SuccessNotification } from "@src/utils.js"
import { Axios } from "@src/api"
import { fetchSymptoms } from "./api"


/**
 * Main Home component that serves as the container for the ADHD Symptom Tracker dashboard
 */
const Dashboard = () => {
    const user = useSelector(state => state.user)

    const getLocalDateString = (date = new Date()) => format(date, DATE_FORMAT_STRING);

    const [selectedDate, setSelectedDate] = useState(getLocalDateString());
    const [SYMPTOMS, SET_SYMPTOMS] = useState([])
    const [symptoms, setSymptoms] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [totalScore, setTotalScore] = useState(0)
    const [entryAlreadySaved, setEntryAlreadySaved] = useState(false);
    const [entryDatesMap, setEntryDatesMap] = useState({})
    const [reloadChart, setReloadChart] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState("all")
    const [selectedRange, setSelectedRange] = useState("Month")



    useEffect(() => {
        const loadSymptoms = async () => {
            const data = await fetchSymptoms();
            SET_SYMPTOMS(data);
        };

        loadSymptoms();
    }, []);



    const fetchSymptomEntryForDate = async (date) => {

        try {
            const res = await Axios.get("/symptom-logs/by-date", {
                params: {
                    userId: user?._id,
                    date,
                }
            });

            console.log(res)

            if (res.status === 200) {
                // Populate saved symptoms and score
                const savedScores = res.data.scores;

                const updatedSymptoms = SYMPTOMS.map(symptom => {
                    const matchingScore = savedScores.find(s => s.symptomId === symptom.id);
                    return {
                        ...symptom,
                        value: matchingScore?.score || symptom.value,
                    }
                });

                setSymptoms(updatedSymptoms);
                setEntryAlreadySaved(true);
            }
        } catch (err) {
            if (err?.response?.status === 404) {
                // No entry found
                const initialSymptoms = SYMPTOMS.map((symptom) => ({
                    ...symptom,
                    value: symptom.value,
                }));
                setSymptoms(initialSymptoms);
                setEntryAlreadySaved(false);
            } else {
                ErrorNotification("Failed to fetch entry for selected date");
            }
        }
    };


    const fetchAllSavedEntryDates = async () => {
        try {
            const res = await Axios.get("/symptom-logs/dates", {
                params: { userId: user?._id }
            })

            if (res.status === 200) {
                // console.log(res?.data?.datesWithEntries);

                const map = Object.fromEntries(
                    res.data.datesWithEntries.map(dateStr => [dateStr, true])
                );

                setEntryDatesMap(map);
            }
        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to fetch all dates with entries');
            throw error.response ? error : new Error("Something went wrong while fetching all dates with entries");
        }
    }


    // Initialize symptoms with default values
    useEffect(() => {
        const initialSymptoms = SYMPTOMS?.map((symptom) => ({
            ...symptom,
            value: symptom.value,
        }))

        setSymptoms(initialSymptoms)
    }, [])

    // Calculate total score whenever symptoms change
    useEffect(() => {
        const score = calculateTotalScore(symptoms)
        setTotalScore(score)
    }, [symptoms])

    // Fetch Symptom Entry For Selected Date
    useEffect(() => {
        if (user?._id && SYMPTOMS.length > 0) {
            fetchSymptomEntryForDate(selectedDate);
        }
    }, [selectedDate, user?._id, SYMPTOMS]);


    useEffect(() => {
        if (user?._id) {
            fetchAllSavedEntryDates()
        }
    }, [user?._id])



    // Handle symptom value change
    const handleSymptomChange = (id, value) => {
        setSymptoms((prevSymptoms) => prevSymptoms.map((symptom) => (symptom.id === id ? { ...symptom, value } : symptom)))
    }

    // Handle save button click
    const handleSaveEntry = async (scores) => {

        // console.log("Saving Entry With Date",  selectedDate)

        try {
            setIsSaving(true);
            const response = await Axios.post('/symptom-logs', {
                userId: user?._id,
                date: selectedDate,
                scores
            });

            if (response.status === 201 || response.status === 200) {
                SuccessNotification('Entry saved successfully!');
                setReloadChart(prevState => !prevState)
                // ✅ Refresh entry data and saved dates immediately
                await fetchSymptomEntryForDate(selectedDate);
                await fetchAllSavedEntryDates();
                return response.data;
            }
        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to save entry.');
            throw error.response ? error : new Error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    }


    // Handle delete entry 
    const handleDeleteEntry = async () => {

        // console.log("Deleting Entry With Date",  selectedDate)

        try {
            setIsDeleting(true);
            const response = await Axios.delete('/symptom-logs', {
                params: {
                    userId: user?._id,
                    date: selectedDate,
                }
            });

            if (response.status === 200) {
                SuccessNotification('Entry deleted successfully!');
                setReloadChart(prevState => !prevState)
                // ✅ Refresh entry data and saved dates immediately after deleting enry
                await fetchSymptomEntryForDate(selectedDate);
                await fetchAllSavedEntryDates();
                return response.data;
            }
        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to delete entry.');
            throw error.response ? error : new Error("Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    }



    return (
        <main
            className="px-4 md:px-12 py-6 overflow-hidden"
        >

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Daily Symptom Log</h1>
                <p className="text-gray-600">{formatDate(selectedDate)}</p>
            </div>

            <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Symptoms section */}
                    <SymptomList
                        symptoms={symptoms}
                        onSymptomChange={handleSymptomChange}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        handleSaveEntry={handleSaveEntry}
                        handleDeleteEntry={handleDeleteEntry}
                        entryAlreadySaved={entryAlreadySaved}
                    />

                </div>

                {/* Right column */}
                <div>
                    <CalendarPicker
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        entryDatesMap={entryDatesMap}
                    />
                    {
                        entryAlreadySaved && (
                            <div className="mt-6">
                                <SymptomScoreCard
                                    score={totalScore} />
                            </div>
                        )
                    }
                </div>
            </div>



            {/* Charts */}
            <section className="bg-gray-100 rounded-3xl mt-12 py-12 px-4 md:px-12">


                <h3
                    className="text-3xl md:text-5xl font-bold mb-6 text-gray-700 text-center "
                >
                    Symptoms Charts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <SymptomTrendsChart
                            selectedSymptom={selectedSymptom}
                            setSelectedSymptom={setSelectedSymptom}
                            selectedRange={selectedRange}
                            setSelectedRange={setSelectedRange}
                            reloadChart={reloadChart}
                        />
                    </div>

                    <div>
                        <SymptomChangeFromBaselineChart
                            selectedSymptom={selectedSymptom}
                            setSelectedSymptom={setSelectedSymptom}
                            reloadChart={reloadChart}
                        />
                    </div>
                </div>
            </section>


        </main>
    )
}

export default Dashboard
