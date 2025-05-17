import React, { useState } from 'react';
import { Axios } from "@src/api";
import Papa from 'papaparse';
import { BiLoaderAlt } from 'react-icons/bi';

const DownloadSymptomLogsButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Formats symptom log data into CSV format with specific symptoms
   * @param {Array} symptomLogs - Array of symptom log objects from API
   * @returns {Array} Array of objects ready for Papa.unparse
   */
  const formatSymptomLogDataToCSV = (symptomLogs) => {
    if (!symptomLogs || symptomLogs.length === 0) {
      return [];
    }

    // Flatten the symptom logs to include name, date, and each symptom with its score
    return symptomLogs.map(log => {
      const flattenedLog = {
        name: log.name || 'Unknown',
        date: log.date || 'Unknown Date', // Ensure date is captured
      };

      // Add all symptoms with their scores as columns
      if (log.scores && Array.isArray(log.scores)) {
        log.scores.forEach(symptom => {
          if (symptom.symptomId && symptom.score !== undefined) {
            flattenedLog[symptom.symptomId] = symptom.score;
          }
        });
      }

      return flattenedLog;
    });
  };

  /**
   * Fetch all symptom logs and download as CSV using Papaparse
   */
  const handleDownloadSymptomLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch symptom logs from API
      const response = await Axios.get("/symptom-logs");
      const symptomLogs = response.data.symptomLogs;

      if (!symptomLogs || symptomLogs.length === 0) {
        alert("No symptom logs found.");
        setIsLoading(false);
        return;
      }

      // Format data for CSV
      const formattedData = formatSymptomLogDataToCSV(symptomLogs);

      // Use PapaParse to convert to CSV
      const csv = Papa.unparse(formattedData, {
        header: true,
        skipEmptyLines: true
      });

      // Create and download blob
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Create a link element to download the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `symptom-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download symptom logs:", error);
      alert("Failed to download symptom logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadSymptomLogs}
      disabled={isLoading}
      className="btn-primary"
    >

      {isLoading ? (
        <div className='flex'>
          Downloading
          <BiLoaderAlt className="animate-spin text-2xl ml-2" />
        </div>
      ) : (
        'Export Symptom Entries'
      )}
    </button>
  );
};

export default DownloadSymptomLogsButton;
