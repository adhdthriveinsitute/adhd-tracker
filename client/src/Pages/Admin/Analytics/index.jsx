import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import SymptomTrendsChart from "./SymptomTrendsChart";
import BestReductionChart from "./BestReductionChart";
import DownloadSymptomLogsButton from "./DownloadSymptomLogsButton";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import {
  fetchAllUsers,
  fetchAllSavedEntryDates,
  fetchSymptomEntryForDate
} from "./api";
import { subDays, subMonths, parse, format } from "date-fns";
import { DATE_FORMAT_STRING } from "@src/constants";
import { Axios } from "@src/api";
import { ErrorNotification } from "@src/utils";


const Analytics = () => {
  // const admin = useSelector(state => state.user);
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedSymptom, setSelectedSymptom] = useState("all");
  const [selectedRange, setSelectedRange] = useState("Month");
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [reductionData, setReductionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overallChange, setOverallChange] = useState(null);
  const [symptomsFromBackend, setSymptomsFromBackend] = useState([])


  const getSymptomLabel = (id) => {
    if (id === "all") return "All Symptoms";
    return symptomsFromBackend.find(s => s.id === id)?.name || id;
  };

  const getUserLabel = (id) => {
    if (id === "all") return "All Users";
    return users.find(u => u.value === id)?.label || id;
  };



  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const res = await Axios.get("/symptoms");
      // console.log(res.data.symptoms)
      setSymptomsFromBackend(res.data.symptoms);
    } catch (error) {
      ErrorNotification(error?.response?.data?.error || 'Failed to fetch symptoms.');
      throw error.response ? error : new Error("Something went wrong");
    }
  };


  const ALL_SYMPTOMS_OPTION = { value: "all", label: "All Symptoms" };
  const symptomOptions = [ALL_SYMPTOMS_OPTION, ...symptomsFromBackend.map(symptom => ({ value: symptom.id, label: symptom.name }))];

  const timeRanges = ["Week", "Month", "3 Months", "6 Months", "Year"];
  const timeRangeOptions = timeRanges.map(label => ({ label, value: label }));

  useEffect(() => {
    const loadUsers = async () => {
      const result = await fetchAllUsers();
      const userOptions = result.map(u => ({ label: u.name, value: u._id }));
      setUsers([{ label: "All Users", value: "all" }, ...userOptions]);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadCharts = async () => {
      setLoading(true);
      const cutoff = getCutoffForRange(selectedRange);

      const userIds = selectedUser === "all" ? users.filter(u => u.value !== "all").map(u => u.value) : [selectedUser];
      const mergedData = [];
      const reductionScores = {};

      for (const userId of userIds) {
        const datesMap = await fetchAllSavedEntryDates(userId);
        let dates = Object.keys(datesMap).sort();
        if (cutoff) {
          dates = dates.filter(dateStr => parse(dateStr, DATE_FORMAT_STRING, new Date()) >= cutoff);
        }

        for (const date of dates) {
          const entry = await fetchSymptomEntryForDate(userId, date);
          const symptoms = entry.symptoms;
          let score = 0;

          if (selectedSymptom === "all") {
            score = symptoms.reduce((acc, s) => acc + (s?.value || 0), 0);
          } else {
            const match = symptoms.find(s => s.id === selectedSymptom || s.symptomId === selectedSymptom);
            score = match?.value ?? 0;
          }

          mergedData.push({
            date: format(parse(date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy"),
            score
          });

          for (const s of symptoms) {
            const key = s.id || s.symptomId; // normalize key
            if (!reductionScores[key]) {
              reductionScores[key] = [];
            }
            reductionScores[key].push(s.value);
          }

        }
      }

      const averagedReductions = Object.entries(reductionScores).map(([symptomId, values]) => {
        // Compute average daily change percentage
        let changePercentage;
        if (values.length > 1) {
          let percentChanges = [];
          for (let i = 1; i < values.length; i++) {
            const prev = values[i - 1];
            const curr = values[i];
            if (prev !== 0) {
              const pctChange = ((curr - prev) / prev) * 100;
              percentChanges.push(pctChange);
            }
          }

          if (percentChanges.length) {
            const avgPctChange = percentChanges.reduce((a, b) => a + b, 0) / percentChanges.length;
            changePercentage = `${avgPctChange.toFixed(2)}% avg/day`;
          } else {
            changePercentage = "No valid baseline to compute change";
          }
        } else {
          changePercentage = "Not enough data";
        }


        return {
          symptom: symptomsFromBackend.find(s => s.id === symptomId)?.name || symptomId,
          change: changePercentage
        };
      });


      averagedReductions.sort((a, b) => b.reduction - a.reduction);
      const top5Reductions = averagedReductions.slice(0, 5);

      let overallChangeValue = null;

      if (selectedSymptom === "all") {
        const sortedData = [...mergedData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstScore = sortedData[0]?.score ?? 0;
        const lastScore = sortedData[sortedData.length - 1]?.score ?? 0;

        if (firstScore === 0) {
          if (lastScore === 0) {
            overallChangeValue = "No change";
          } else {
            // If the first score is 0 and last score is not, consider the change as a percentage from 1 (avoids Infinity)
            overallChangeValue = `Started from 0 → ${lastScore} (${(100 * lastScore).toFixed(2)}% increase)`;
          }
        } else {
          const change = ((lastScore - firstScore) / firstScore) * 100;
          overallChangeValue = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
        }

      } else {
        const values = reductionScores[selectedSymptom];
        if (values && values.length > 1) {
          const percentChanges = [];

          for (let i = 1; i < values.length; i++) {
            const prev = values[i - 1];
            const curr = values[i];

            if (prev === 0 && curr !== 0) {
              // 0 → X (e.g., 0 → 5) = 100% increase
              percentChanges.push(100);
            } else if (prev !== 0 && curr === 0) {
              // X → 0 (e.g., 10 → 0) = 100% decrease
              percentChanges.push(-100);
            } else if (prev !== 0) {
              // Normal percentage change
              percentChanges.push(((curr - prev) / prev) * 100);
            }
            // Skip if both prev and curr are 0
          }

          if (percentChanges.length) {
            const avg = percentChanges.reduce((a, b) => a + b, 0) / percentChanges.length;
            overallChangeValue = `${avg.toFixed(2)}% avg/day`;
          } else {
            overallChangeValue = "No change";
          }
        } else {
          overallChangeValue = "Not enough data";
        }


      }

      setChartData(mergedData);
      setReductionData(top5Reductions);
      setOverallChange(overallChangeValue);
      setLoading(false);
    };



    if (users.length) loadCharts();
  }, [selectedUser, selectedSymptom, selectedRange, users]);

  const getCutoffForRange = (range) => {
    const now = new Date();
    switch (range) {
      case "Week": return subDays(now, 7);
      case "Month": return subMonths(now, 1);
      case "3 Months": return subMonths(now, 3);
      case "6 Months": return subMonths(now, 6);
      case "Year": return subMonths(now, 12);
      default: return null;
    }
  };



  return (
    <main className="px-4 md:px-12 py-6 overflow-hidden">
      <section className="bg-gray-100 rounded-3xl mt-12 py-12 px-4 md:px-12">

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 ">
          <h3 className="text-3xl md:text-5xl font-bold text-gray-700 text-center md:mb-0 mb-6">
            Admin Analytics
          </h3>


          <DownloadSymptomLogsButton />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center mb-8">
          <Dropdown field="user" options={users} value={selectedUser} onChange={setSelectedUser} placeholder="Select User" disableFormik />
          <Dropdown field="symptom" options={symptomOptions} value={selectedSymptom} onChange={setSelectedSymptom} placeholder="Select Symptom" disableFormik />
          <Dropdown field="range" options={timeRangeOptions} value={selectedRange} onChange={setSelectedRange} placeholder="Select Time Range" disableFormik />
        </div>

        {overallChange !== null && (
          <div className="text-center mb-8">
            <div
              className={`inline-block px-6 py-3 rounded-xl font-semibold text-xl shadow-sm ${parseFloat(overallChange) < 0
                  ? 'text-c-zinc bg-white'
                  : 'text-red-500 bg-red-100'
                }`}
            >
              Overall Change in <strong>{getSymptomLabel(selectedSymptom)} </strong>
              for <strong>{getUserLabel(selectedUser)} </strong>
              over the last <strong>{selectedRange}</strong> is
              <strong> {overallChange}</strong>
            </div>
          </div>
        )}



        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <SymptomTrendsChart
            chartData={chartData}
            selectedSymptom={selectedSymptom}
            loading={loading}
          />

          <BestReductionChart
            data={reductionData}
            loading={loading}
          />
        </div>
      </section>
    </main>
  );
};

export default Analytics;
