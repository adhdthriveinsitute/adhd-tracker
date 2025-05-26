import { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { DATE_FORMAT_STRING } from "@src/constants";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import { fetchAllSavedEntryDates, fetchSymptomEntryForDate } from "./api";
import { useSelector, useDispatch } from 'react-redux';
import { format, parse, parseISO, subDays, subMonths } from "date-fns";
import DateInput from "@src/Components/DateInput";

const SymptomTrendsChart = ({
  selectedSymptom,
  setSelectedSymptom,
  selectedRange,
  setSelectedRange,
  reloadChart,
  SYMPTOMS,
  startDate,
  endDate,
  setStartDate,
  setEndDate

}) => {

  const dispatch = useDispatch();
  // const symptomsFromRedux = useSelector(state => state.symptomsList.symptoms);
  // console.log(symptomsFromRedux)

  // useEffect(() => {
  //   if (symptomsFromRedux.length === 0) {
  //     dispatch(fetchSymptoms());
  //   }
  // }, [dispatch, symptomsFromRedux.length]);

  const ALL_SYMPTOMS_OPTION = { value: "all", label: "All Symptoms" };
  const symptomOptions = [
    ALL_SYMPTOMS_OPTION,
    ...SYMPTOMS.map(symptom => ({ value: symptom.id, label: symptom.name }))
  ];

  const timeRanges = [
    "Week", "Month", "3 Months", "6 Months", "Year", "All Time", "Custom"
  ]
  const timeRangeOptions = useMemo(() => {
    return timeRanges.map(label => ({ label, value: label }));
  }, []);


  // Initialize defaults immediately, not in useEffect
  const currentSelectedSymptom = selectedSymptom || "all";
  const currentSelectedRange = selectedRange || "Week";

  // Set defaults if not already set
  useEffect(() => {
    if (!selectedSymptom) {
      setSelectedSymptom("all");
    }
    if (!selectedRange) {
      setSelectedRange("Week");
    }
  }, [selectedSymptom, selectedRange, setSelectedSymptom, setSelectedRange]);

  const user = useSelector(state => state.user);
  const userId = user?._id;

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCutoffForRange = useCallback((range) => {
    const now = new Date();
    switch (range) {
      case "Week": return subDays(now, 7);
      case "Month": return subMonths(now, 1);
      case "3 Months": return subMonths(now, 3);
      case "6 Months": return subMonths(now, 6);
      case "Year": return subMonths(now, 12);
      case "All Time": return null;
      default: return null;
    }
  }, []);



  useEffect(() => {
    if (selectedRange !== "Custom") {
      const now = new Date();
      const cutoff = getCutoffForRange(selectedRange);
      setStartDate(cutoff);
      setEndDate(now);
    }
  }, [selectedRange, getCutoffForRange]);




  useEffect(() => {
    if (startDate && endDate && selectedRange !== "Custom") {
      const expectedCutoff = getCutoffForRange(selectedRange);
      const now = new Date();

      if (
        Math.abs(startDate - expectedCutoff) > 86400000 || // 1 day
        Math.abs(endDate - now) > 86400000
      ) {
        setSelectedRange("Custom");
      }
    }
  }, [startDate, endDate, selectedRange, getCutoffForRange]);




  useEffect(() => {
    if (!userId || SYMPTOMS.length === 0) return;

    const loadChartData = async () => {
      setLoading(true);
      try {
        const datesMap = await fetchAllSavedEntryDates(userId);
        let dates = Object.keys(datesMap).sort();

        // Apply date filtering based on range
        if (currentSelectedRange === "Custom" && startDate && endDate) {
          const start = new Date(startDate.setHours(0, 0, 0, 0));
          const end = new Date(endDate.setHours(23, 59, 59, 999));
          dates = dates.filter(dateStr => {
            const parsedDate = parse(dateStr, DATE_FORMAT_STRING, new Date());
            return parsedDate >= start && parsedDate <= end;
          });
        } else {
          const cutoff = getCutoffForRange(currentSelectedRange);
          if (cutoff) {
            dates = dates.filter(dateStr => parse(dateStr, DATE_FORMAT_STRING, new Date()) >= cutoff);
          }
        }

        const allData = [];
        for (const date of dates) {
          const { symptoms } = await fetchSymptomEntryForDate(userId, date, SYMPTOMS);
          let score = 0;

          if (currentSelectedSymptom === "all") {
            score = symptoms.reduce((acc, s) => acc + (s?.value || 0), 0);
          } else {
            const match = symptoms.find(
              s =>
                (s.id?.toLowerCase?.() === currentSelectedSymptom?.toLowerCase?.()) ||
                (s.symptomId?.toLowerCase?.() === currentSelectedSymptom?.toLowerCase?.())
            );
            score = match?.value ?? 0;
          }

          allData.push({
            date: format(parse(date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy"),
            score
          });
        }

        setChartData(allData);
      } catch (err) {
        console.error("Error loading chart data", err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [currentSelectedSymptom, currentSelectedRange, userId, reloadChart, SYMPTOMS, startDate, endDate]);


  const maxY = currentSelectedSymptom === "all" ? 220 : 10;

  return (
    <div className="w-full p-4 bg-white shadow rounded-3xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Symptom Trends</h2>

      <div className="flex flex-col gap-4 mb-6">

        {/* First Row: Dropdowns */}
        <div className="flex gap-4 flex-wrap">
          <div className="max-w-xs w-full">
            <Dropdown
              field="selectedSymptom"
              options={symptomOptions}
              placeholder="Select Symptom"
              disableFormik
              value={currentSelectedSymptom}
              onChange={setSelectedSymptom}
            />
          </div>

          <div className="max-w-xs w-full">
            <Dropdown
              field="selectedRange"
              options={timeRangeOptions}
              placeholder="Select Range"
              disableFormik
              value={currentSelectedRange}
              onChange={setSelectedRange}
            />
          </div>
        </div>

        {/* Second Row: Custom Date Inputs */}
        {currentSelectedRange === "Custom" && (
          <div className="flex gap-4 flex-wrap">
            <div className="max-w-xs w-full">
              <DateInput
                label_text="Start Date"
                placeholder="Start Date"
                value={startDate}
                onChange={setStartDate}
                maxDate={new Date()}
              />
            </div>

            <div className="max-w-xs w-full">
              <DateInput
                label_text="End Date"
                placeholder="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        )}
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