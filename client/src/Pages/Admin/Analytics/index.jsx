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
import { SYMPTOMS, DATE_FORMAT_STRING } from "@src/constants";

const ALL_SYMPTOMS_OPTION = { value: "all", label: "All Symptoms" };
const symptomOptions = [ALL_SYMPTOMS_OPTION, ...SYMPTOMS.map(symptom => ({ value: symptom.id, label: symptom.name }))];

const timeRanges = ["Week", "Month", "3 Months", "6 Months", "Year"];
const timeRangeOptions = timeRanges.map(label => ({ label, value: label }));

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
            if (!reductionScores[s.id]) {
              reductionScores[s.id] = [];
            }
            reductionScores[s.id].push(s.value);
          }
        }
      }

      const averagedReductions = Object.entries(reductionScores).map(([symptomId, values]) => {
        const baseline = values[0];
        const latest = values[values.length - 1];
        const reduction = baseline - latest;
        return {
          symptom: SYMPTOMS.find(s => s.id === symptomId)?.name || symptomId,
          reduction: ((reduction / baseline) * 100).toFixed(2)
        };
      });

      averagedReductions.sort((a, b) => b.reduction - a.reduction);
      const top5Reductions = averagedReductions.slice(0, 5);

      let totalChange = 0;
      let count = 0;

      Object.values(reductionScores).forEach(values => {
        const baseline = values[0];
        const latest = values[values.length - 1];
        if (baseline && latest != null) {
          const change = ((latest - baseline) / baseline) * 100;
          totalChange += change;
          count++;
        }
      });

      const overallChangeValue = count > 0 ? (totalChange / count).toFixed(2) : null;
      setOverallChange(overallChangeValue);


      setChartData(mergedData);
      setReductionData(top5Reductions);
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
            <div className={`inline-block px-6 py-3 rounded-xl font-semibold text-lg shadow-sm ${overallChange < 0 ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'
              }`}>
              Overall Change: {overallChange < 0 ? '' : '+'}{overallChange}%
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
