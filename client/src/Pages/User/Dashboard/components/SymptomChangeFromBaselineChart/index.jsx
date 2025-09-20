import { useCallback, useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"
import { useSelector } from "react-redux"
import {
  fetchAllSavedEntryDates,
  fetchSymptomEntryForDate
} from "../SymptomTrendsChart/api"
import { format, parse, subDays, subMonths } from "date-fns"
import { DATE_FORMAT_STRING } from "@src/constants"
// import { selectSymptoms } from "@src/redux/slices/symptomsSlice"

const SymptomChangeFromBaselineChart = ({
  reloadChart,
  selectedSymptom,
  selectedRange,
  SYMPTOMS,
  startDate,
  endDate

}
) => {
  // const symptomsFromBackend = useSelector(selectSymptoms);
  const user = useSelector(state => state.user)
  const userId = user?._id

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)





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
    if (startDate && endDate && selectedRange !== "Custom") {
      const expectedCutoff = getCutoffForRange(selectedRange);
      const now = new Date();

      if (
        Math.abs(startDate - expectedCutoff) > 86400000 || // 1 day
        Math.abs(endDate - now) > 86400000
      ) {
        // setSelectedRange("Custom");
      }
    }
  }, [startDate, endDate, selectedRange, getCutoffForRange]);



  useEffect(() => {
    if (!userId || SYMPTOMS.length === 0) return; // avoid loading with incomplete SYMPTOMS


    const loadChartData = async () => {
      setLoading(true);
      try {
        const datesMap = await fetchAllSavedEntryDates(userId)
        let dates = Object.keys(datesMap).sort()

        let filteredDates = [...Object.keys(datesMap).sort()];

        if (selectedRange === "Custom" && startDate && endDate) {
          filteredDates = filteredDates.filter(dateStr => {
            const parsedDate = parse(dateStr, DATE_FORMAT_STRING, new Date());
            return parsedDate >= startDate && parsedDate <= endDate;
          });
        } else {
          const cutoff = getCutoffForRange(selectedRange);
          if (cutoff) {
            filteredDates = filteredDates.filter(dateStr => {
              const parsedDate = parse(dateStr, DATE_FORMAT_STRING, new Date());
              return parsedDate >= cutoff;
            });
          }
        }

        let baseline = null;
        const allData = [];

        for (const date of filteredDates) {
          const { symptoms } = await fetchSymptomEntryForDate(userId, date, SYMPTOMS);

          let score = 0;
          if (selectedSymptom === "all") {
            // Only include numeric values, ignore null values
            score = symptoms.reduce((acc, s) => {
              const value = s?.value;
              return acc + (typeof value === 'number' ? value : 0);
            }, 0);
          } else {
            const match = symptoms.find(s => s.id === selectedSymptom || s.symptomId === selectedSymptom);
            const value = match?.value;
            // Only use numeric values, treat null as 0 for individual symptoms
            score = typeof value === 'number' ? value : 0;
          }

          if (baseline === null) baseline = score;

          const safeBaseline = baseline === 0 ? 1 : baseline;
          const change = score / safeBaseline;
          const changePercent = Math.round((change - 1) * 100);

          allData.push({
            date: format(parse(date, DATE_FORMAT_STRING, new Date()), "MMM dd yyyy"),
            change,
            changePercent
          });
        }

        setChartData(allData);

      } catch (err) {
        console.error("Error loading baseline chart data", err)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [selectedSymptom, selectedRange, userId, reloadChart, SYMPTOMS, startDate, endDate])


  const latestChange = chartData.length > 0 ? chartData[chartData.length - 1].changePercent : 0
  const changeColor = latestChange > 0 ? "text-red-600" : "text-green-600"

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 border border-gray-100 h-full">
      <h2 className="text-xl font-semibold mb-4 md:mb-20 text-gray-700">Symptom Score Change from Baseline</h2>

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
                dataKey="change"
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => d}
                tick={{
                  fontSize: 10,
                  fill: '#364153'
                }}
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
                dataKey="change"
                stroke="#00897b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Latest Change from Baseline: <span className={changeColor}>{latestChange}%</span>
        </p>
      </div>
    </div>
  )
}

export default SymptomChangeFromBaselineChart
