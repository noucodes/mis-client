"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Search } from "lucide-react"; // Optional: for nice search icon

interface AttendanceRecord {
  userId: string;
  name: string;
  date: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: string;
  status: string;
  statusColor: string;
  overtime: string;
  undertime: string;
}

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sourceInfo, setSourceInfo] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentDisplayDate, setCurrentDisplayDate] = useState<string>("");
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLive = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = date || selectedDate;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const res = await fetch(`${API_URL}/attendance?date=${targetDate}&t=${Date.now()}`);
      
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();

      const users = json.users || [];
      setData(users);
      setFilteredData(users); // Initially show all
      setLastUpdated(new Date().toLocaleString("en-US"));
      setCurrentDisplayDate(
        users?.[0]?.date || format(new Date(targetDate), "MM/dd/yyyy")
      );
      
      if (json.warning) {
        setSourceInfo(`Warning: ${json.warning}`);
      } else if (json.source === "device") {
        setSourceInfo("Live • Connected to device");
      } else if (json.source?.includes("database")) {
        setSourceInfo("Database • Device offline");
      } else {
        setSourceInfo("Offline • No data");
      }
      
      setIsInitialLoad(false);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
      setData([]);
      setFilteredData([]);
      setSourceInfo("Connection Error");
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // Filter data when search term or data changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((record) =>
        record.name.toLowerCase().includes(lowerSearch) ||
        record.userId.toLowerCase().includes(lowerSearch)
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, data]);

  useEffect(() => {
    fetchLive();

    const interval = setInterval(() => {
      fetchLive();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setCurrentPage(1);
    setSearchTerm(""); // Optional: clear search when changing date
    fetchLive(newDate);
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    setCurrentPage(1);
    setSearchTerm("");
    fetchLive(today);
  };

  // Pagination based on filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <main className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Attendance</span>
        </div>
        <h1 className="text-3xl font-bold text-balance">Attendance</h1>
        <p className="text-muted-foreground text-balance">
          Manage your employees info and data
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-semibold">
              {currentDisplayDate || format(new Date(), "MM/dd/yyyy")}
            </p>
            <p
              className={`text-sm mt-1 font-medium ${
                sourceInfo.includes("offline") || sourceInfo.includes("Error") || sourceInfo.includes("Warning")
                  ? "text-orange-500"
                  : sourceInfo.includes("Database")
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              {sourceInfo}
            </p>
          </div>
          
          <Link 
            href={`/hr/history?date=${selectedDate}&view=history`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm font-medium rounded-lg transition border"
          >
            View History
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          {/* Date Filter + Today Button */}
          <div className="flex gap-3 items-center">
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
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm font-medium rounded-lg transition"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Time In</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Time Out</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">OT</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">UT</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isInitialLoad && loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground">
                    Loading attendance data...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground">
                    {searchTerm 
                      ? `No results found for "${searchTerm}"`
                      : "No attendance records for this date"}
                  </td>
                </tr>
              ) : (
                currentData.map((r) => (
                  <tr key={r.userId} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-mono text-sm font-bold">{r.userId || "N/A"}</td>
                    <td className="px-6 py-4 font-medium">{r.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-medium">
                      {r.timeIn || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-medium">
                      {r.timeOut || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{r.hoursWorked || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {r.overtime || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-orange-600 dark:text-orange-400">
                      {r.undertime || "—"}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${r.statusColor}`}>
                      {r.status || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
              {filteredData.length} {filteredData.length !== data.length && `(filtered from ${data.length})`}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border bg-background hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
    </main>
  );
}