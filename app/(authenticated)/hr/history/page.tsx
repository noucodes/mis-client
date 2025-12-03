"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react"; // Optional: nice icon

interface HistoryRecord {
  id: number;
  employee_id: string;
  employee_name: string;
  punch_time: string;
  punch_date: string;
  punch_time_formatted: string;
  created_at: string;
}

export default function AttendanceHistoryPage() {
  const searchParams = useSearchParams();
  const dateFromUrl = searchParams.get("date");

  // Data & UI state
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    dateFromUrl || format(new Date(), "yyyy-MM-dd")
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [sourceInfo, setSourceInfo] = useState<string>("");

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      // Trigger device sync first
      await fetch(`${API_URL}/attendance?date=${selectedDate}&t=${Date.now()}`);

      const res = await fetch(`${API_URL}/attendance/history/date/${selectedDate}`);
      if (!res.ok) throw new Error("Failed to fetch history");

      const json = await res.json();

      const sortedData = (json.data || []).sort((a: HistoryRecord, b: HistoryRecord) => {
        const dateA = new Date(a.created_at || a.punch_time).getTime();
        const dateB = new Date(b.created_at || b.punch_time).getTime();
        return dateB - dateA;
      });

      setHistoryData(sortedData);
      setFilteredData(sortedData); // Reset filtered data
      setTotalRecords(json.pagination?.total || json.total_punches || sortedData.length);
      setLastUpdated(new Date().toLocaleString("en-US"));
      setSourceInfo("Live • Connected to device");

      setIsInitialLoad(false);
    } catch (err: any) {
      console.error("History fetch error:", err);
      setHistoryError(err.message);
      setHistoryData([]);
      setFilteredData([]);
      setSourceInfo("Connection Error");
      setIsInitialLoad(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter data whenever search term or full data changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(historyData);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = historyData.filter((record) =>
        record.employee_name.toLowerCase().includes(lowerSearch) ||
        record.employee_id.toLowerCase().includes(lowerSearch)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, historyData]);

  useEffect(() => {
    fetchHistory();

    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSearchTerm(""); // Clear search when date changes
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    setSearchTerm("");
  };

  return (
    <main className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Attendance History</span>
        </div>
        <h1 className="text-3xl font-bold text-balance">Attendance History</h1>
        <p className="text-muted-foreground text-balance">
          View all punch records and attendance summaries
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-semibold">
              {selectedDate ? format(new Date(selectedDate), "MM/dd/yyyy") : format(new Date(), "MM/dd/yyyy")}
            </p>
            <p className={`text-sm mt-1 font-medium ${sourceInfo.includes("Error") ? "text-orange-500" : "text-green-500"}`}>
              {sourceInfo}
            </p>
          </div>

          <a
            href={`/hr/attendance?date=${selectedDate}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm font-medium rounded-lg transition border"
          >
            View Attendance
          </a>
        </div>

        {/* Search + Date Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 lg:w-80 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <div className="flex gap-3 items-center">
            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
              <label htmlFor="date-filter" className="text-sm font-medium">Date:</label>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={format(new Date(), "yyyy-MM-dd")}
                className="bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>

            {selectedDate !== format(new Date(), "yyyy-MM-dd") && (
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm font-medium rounded-lg transition whitespace-nowrap"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {historyError && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
          <strong>Error:</strong> {historyError}
        </div>
      )}

      {/* Punch History Table */}
      <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg font-semibold">Punch Records</h2>
            <div className="text-sm text-muted-foreground">
              Total: {filteredData.length} {searchTerm && `(filtered from ${historyData.length})`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Recorded At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isInitialLoad && historyLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">
                    Loading punch records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">
                    {searchTerm
                      ? `No records found for "${searchTerm}"`
                      : "No punch records found for the selected date"}
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-mono text-sm font-bold">
                      {record.employee_id}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {record.employee_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(record.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
    </main>
  );
}