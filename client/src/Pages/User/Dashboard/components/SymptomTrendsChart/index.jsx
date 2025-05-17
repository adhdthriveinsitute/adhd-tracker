import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { DATE_FORMAT_STRING, SYMPTOMS } from "@src/constants";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import { fetchAllSavedEntryDates, fetchSymptomEntryForDate } from "./api";
import { useSelector } from "react-redux";
import { format, parse, parseISO, subDays, subMonths } from "date-fns";

const ALL_SYMPTOMS_OPTION = { value: "all", label: "All Symptoms" };
const symptomOptions = [
  ALL_SYMPTOMS_OPTION,
  ...SYMPTOMS.map(symptom => ({ value: symptom.id, label: symptom.name }))
];

const timeRanges = ["Week", "Month", "3 Months", "6 Months", "Year"];
const timeRangeOptions = timeRanges.map(label => ({ label, value: label }));

const SymptomTrendsChart = ({ selectedSymptom, setSelectedSymptom, selectedRange, setSelectedRange, reloadChart }) => {
  const user = useSelector(state => state.user);
  const userId = user?._id;

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return

    const loadChartData = async () => {
      setLoading(true)
      try {
        const datesMap = await fetchAllSavedEntryDates(userId)
        let dates = Object.keys(datesMap).sort()

        const cutoff = getCutoffForRange(selectedRange)
        if (cutoff) {
          dates = dates.filter(dateStr => parse(dateStr, DATE_FORMAT_STRING, new Date()) >= cutoff)
        }

        const allData = []
        for (const date of dates) {
          const res = await fetchSymptomEntryForDate(userId, date)
          const symptoms = res.symptoms
          let score = 0

          if (selectedSymptom === "all") {
            score = symptoms.reduce((acc, s) => acc + (s?.value || 0), 0)
          } else {
            const match = symptoms.find(s => s.id === selectedSymptom || s.symptomId === selectedSymptom)
            score = match?.value ?? 0
          }

          allData.push({
            date: format(parse(date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy"),
            score
          })
        }

        setChartData(allData)
      } catch (err) {
        console.error("Error loading chart data", err)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [selectedSymptom, selectedRange, userId, reloadChart])

  const maxY = selectedSymptom === "all" ? 220 : 10;




  const getCutoffForRange = (range) => {
    const now = new Date();
    switch (range) {
      case "Week":
        return subDays(now, 7);
      case "Month":
        return subMonths(now, 1);
      case "3 Months":
        return subMonths(now, 3);
      case "6 Months":
        return subMonths(now, 6);
      case "Year":
        return subMonths(now, 12);
      default:
        return null; // No cutoff applied
    }
  };




  return (
    <div className="w-full p-4 bg-white shadow rounded-3xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Symptom Trends</h2>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="max-w-xs">
          <Dropdown
            field="selectedSymptom"
            options={symptomOptions}
            placeholder="Select Symptom"
            disableFormik
            value={selectedSymptom}
            onChange={setSelectedSymptom}
          />
        </div>

        <div className="max-w-xs">
          <Dropdown
            field="selectedRange"
            options={timeRangeOptions}
            placeholder="Select Range"
            disableFormik
            value={selectedRange}
            onChange={setSelectedRange}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loading ? Array(7).fill({ date: "", change: 1 }) : chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => d}
                tick={{ fontSize: 10, fill: "#364153" }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `${((val - 1) * 100).toFixed(0)}%`}
                label={{
                  value: "Change from Baseline",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { textAnchor: "middle", fill: "#364153", fontSize: 12 }
                }}
              />
              <Tooltip
                formatter={(value) => [`${((value - 1) * 100).toFixed(0)}%`, "Change"]}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#00897b"
                strokeWidth={2}
                dot={loading ? false : { r: 4 }}
                activeDot={loading ? false : { r: 6 }}
                isAnimationActive={!loading}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis
              tick={{
                fontSize: 10,
                fill: '#364153'
              }}
              dataKey="date"
            />
            <YAxis
              label={{
                value: "Score",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { textAnchor: "middle", fill: "#364153", fontSize: 12 }
              }}
              domain={[0, maxY]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#00897b"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SymptomTrendsChart;
