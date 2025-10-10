import { useState, useMemo, useCallback, useEffect } from "react";
import { subDays, subMonths, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import SymptomTrendsChart from "./SymptomTrendsChart";
import BestReductionChart from "./BestReductionChart";
import DownloadSymptomLogsButton from "./DownloadSymptomLogsButton";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import DateInput from "@src/Components/DateInput";
import { useAnalyticsData } from "@src/hooks/useAdminAnalytics";

const Analytics = () => {
  // Local state for filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedSymptom, setSelectedSymptom] = useState("all");
  const [selectedRange, setSelectedRange] = useState("Month");

  //  console.log("Selected Filters - User:", selectedUser, "Symptom:", selectedSymptom, "Range:", selectedRange);

  // Memoized time range options
  const timeRangeOptions = useMemo(() => {
    const timeRanges = ["Week", "Month", "3 Months", "6 Months", "Year", "All Time", "Custom"];
    return timeRanges.map(label => ({ label, value: label }));
  }, []);

  // Memoized cutoff function
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

  // Custom hook for data management
  const {
    symptoms,
    users,
    loading,
    chartData,
    reductionData,
    overallChange,
    hasData
  } = useAnalyticsData({
    selectedUser,
    selectedSymptom,
    selectedRange,
    startDate,
    endDate,
    getCutoffForRange
  });

  //  console.log("Analytics Data - Symptoms:", symptoms, "Users:", users, "Loading:", loading, "Overall Change:", overallChange);

  // Memoized symptom options with "All Symptoms" option
  const symptomOptions = useMemo(() => {
    const allSymptomsOption = { value: "all", label: "All Symptoms" };
    const mappedSymptoms = symptoms.map(symptom => ({
      value: symptom.id,
      label: symptom.name
    }));
    return [allSymptomsOption, ...mappedSymptoms];
  }, [symptoms]);

  // Memoized user options with "All Users" option
  const userOptions = useMemo(() => {
    const allUsersOption = { value: "all", label: "All Users" };
    const mappedUsers = users.map(user => ({
      value: user._id,
      label: user.email
    }));
    return [allUsersOption, ...mappedUsers];
  }, [users]);

  // Memoized label functions
  const getSymptomLabel = useCallback((id) => {
    if (id === "all") return "All Symptoms";
    return symptoms.find(s => s.id === id)?.name || id;
  }, [symptoms]);

  const getUserLabel = useCallback((id) => {
    if (id === "all") return "All Users";
    return users.find(u => u._id === id)?.email || id;
  }, [users]);

  // Handle range changes - auto-set dates for predefined ranges
  useEffect(() => {
    if (selectedRange !== "Custom") {
      const now = new Date();
      const cutoff = getCutoffForRange(selectedRange);
      setStartDate(cutoff);
      setEndDate(now);
      //  console.log(`Auto-setting dates: Start Date: ${cutoff}, End Date: ${now}`);
    }
  }, [selectedRange, getCutoffForRange]);

  // Auto-detect custom range when dates are manually changed
  useEffect(() => {
    if (startDate && endDate && selectedRange !== "Custom") {
      const expectedCutoff = getCutoffForRange(selectedRange);
      const now = new Date();

      // Check if dates don't match expected range (with 1 day tolerance)
      if (
        Math.abs(startDate - expectedCutoff) > 86400000 ||
        Math.abs(endDate - now) > 86400000
      ) {
        setSelectedRange("Custom");
        //  console.log("Custom range detected due to manual date change.");
      }
    }
  }, [startDate, endDate, selectedRange, getCutoffForRange]);

  // Memoized filter change handlers to prevent unnecessary re-renders
  const handleUserChange = useCallback((value) => {
    setSelectedUser(value);
    //  console.log("User filter changed:", value);
  }, []);

  const handleSymptomChange = useCallback((value) => {
    setSelectedSymptom(value);
    //  console.log("Symptom filter changed:", value);
  }, []);

  const handleRangeChange = useCallback((value) => {
    setSelectedRange(value);
    //  console.log("Time Range filter changed:", value);
  }, []);

  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
    //  console.log("Start Date changed:", date);
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
    //  console.log("End Date changed:", date);
  }, []);

  // Format date range for display
  const getDateRangeDisplay = useCallback(() => {
    if (selectedRange === "Custom" && startDate && endDate) {
      return `${format(startDate, "MMM dd")} to ${format(endDate, "MMM dd")}`;
    }

    // Treat empty custom range as "All Time"
    if (
      (selectedRange === "All Time") ||
      (selectedRange === "Custom" && !startDate)
    ) {
      return "All Time";
    }



    return selectedRange;
  }, [selectedRange, startDate, endDate]);

  // Determine overall change styling
  const getOverallChangeStyle = useCallback((change) => {
    //  console.log("Overall change value:", change);

    if (!change || change === "No change" || change === "Not enough data") {
      return "text-gray-600 bg-gray-100";
    }

    // Try to parse percentage change
    const numericChange = parseFloat(change);
    if (!isNaN(numericChange)) {
      return numericChange < 0 ? 'text-green-600 bg-green-100' : 'text-red-500 bg-red-100';
    }

    // For non-numeric changes, use neutral styling
    return "text-blue-600 bg-blue-100";
  }, []);

  return (
    <main className="px-4 md:px-12 py-6 overflow-hidden">
      <section className="bg-gray-100 rounded-3xl mt-12 py-12 px-4 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h3 className="text-3xl md:text-5xl font-bold text-gray-700 text-center md:mb-0 mb-6">
            Admin Analytics
          </h3>
          <DownloadSymptomLogsButton />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center mb-8">
          <Dropdown
            field="user"
            options={userOptions}
            value={selectedUser}
            onChange={handleUserChange}
            placeholder="Select User"
            disableFormik
            searchable
          />
          <Dropdown
            field="symptom"
            options={symptomOptions}
            value={selectedSymptom}
            onChange={handleSymptomChange}
            placeholder="Select Symptom"
            disableFormik
          />
          <Dropdown
            field="range"
            options={timeRangeOptions}
            value={selectedRange}
            onChange={handleRangeChange}
            placeholder="Select Time Range"
            disableFormik
          />

          {/* Custom Date Inputs - Only show when Custom range is selected */}
          {selectedRange === "Custom" && (
            <>
              <DateInput
                label_text="Start Date"
                placeholder="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                maxDate={subDays(new Date(), 1)} // Yesterday max
              />
              <DateInput
                label_text="End Date"
                placeholder="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate}
                maxDate={new Date()} // Today max
              />
            </>
          )}
        </div>

        {/* Overall Change Display */}
        {overallChange !== null && (
          <div className="text-center mb-8">
            <div
              className={`inline-block px-6 py-3 rounded-xl font-semibold text-xl shadow-sm ${getOverallChangeStyle(overallChange)}`}
            >
              Overall Change in <strong>{getSymptomLabel(selectedSymptom)}</strong> for{" "}
              <strong>{getUserLabel(selectedUser)}</strong> over{" "}
              <strong>{getDateRangeDisplay()}</strong> is <strong>{overallChange}</strong>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold">
              Loading analytics data...
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !hasData && (
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-3 rounded-xl bg-yellow-100 text-yellow-800 font-semibold">
              No data available for the selected filters. Try adjusting your selection.
            </div>
          </div>
        )}

        {/* Charts - Only render when we have data */}
        {!loading && hasData && (
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
        )}
      </section>
    </main>
  );
};

export default Analytics;
