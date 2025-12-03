"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Clock, Calendar, TrendingUp, TrendingDown, User, CheckCircle, RefreshCw } from "lucide-react";

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
  totalTaps?: number;
}

interface WeeklyAttendance {
  date: string;
  userId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: string;
  overtime: string;
  undertime: string;
  status: string;
}

export default function DashboardPage() {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sourceInfo, setSourceInfo] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 5;
  
  // Use ref to keep track of current page without triggering re-renders
  const currentPageRef = useRef(currentPage);
  
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const fetchAttendance = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = date || selectedDate;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
      
      const res = await fetch(`${API_URL}/employee/attendance?date=${targetDate}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to fetch attendance data");
      }
      
      const json = await res.json();

      setAttendance(json.attendance || null);
      setLastUpdated(new Date().toLocaleString("en-US"));
      
      if (json.warning) {
        setSourceInfo(`Warning: ${json.warning}`);
      } else if (json.source === "device") {
        setSourceInfo("Live");
      } else if (json.source?.includes("database")) {
        setSourceInfo("Database");
      } else {
        setSourceInfo("Offline");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
      setAttendance(null);
      setSourceInfo("Error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly data for the past 7 days or date range
  const fetchWeeklyData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const weekData: WeeklyAttendance[] = [];
      
      let daysToFetch: Date[] = [];
      
      if (startDate && endDate) {
        // Fetch data for date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          daysToFetch.push(new Date(d));
        }
      } else {
        // Default: fetch last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          daysToFetch.push(date);
        }
      }
      
      for (const date of daysToFetch) {
        const dateStr = format(date, "yyyy-MM-dd");
        
        try {
          const res = await fetch(`${API_URL}/employee/attendance?date=${dateStr}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (res.ok) {
            const json = await res.json();
            if (json.attendance) {
              weekData.push({
                date: format(date, "MMM dd"),
                userId: json.attendance.userId,
                name: json.attendance.name,
                timeIn: json.attendance.timeIn,
                timeOut: json.attendance.timeOut,
                hoursWorked: json.attendance.hoursWorked,
                overtime: json.attendance.overtime,
                undertime: json.attendance.undertime,
                status: json.attendance.status,
              });
            }
          }
        } catch (err) {
          console.error(`Failed to fetch data for ${dateStr}`);
        }
      }
      
      // Reverse to show latest dates first
      setWeeklyData(weekData.reverse());
    } catch (err) {
      console.error("Weekly data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchWeeklyData();

    // Auto-refresh every 30 seconds without resetting page
    const interval = setInterval(() => {
      fetchAttendance();
      fetchWeeklyData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate, startDate, endDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAttendance(newDate);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAttendance();
    await fetchWeeklyData();
    setIsRefreshing(false);
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    fetchAttendance(today);
  };

  const handleFilterApply = () => {
    if (startDate && endDate) {
      setCurrentPage(1);
      fetchWeeklyData();
    }
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(weeklyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = weeklyData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Attendance</span>
            </div>
            <h1 className="text-3xl font-bold text-balance">Attendance</h1>
            <p className="text-muted-foreground text-balance">
              Overview of your attendance and work hours
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-card rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Filter by Date Range</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="start-date" className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="end-date" className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilterApply}
              disabled={!startDate || !endDate}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Apply Filter
            </button>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/50">
          <h2 className="text-lg font-semibold">
            {startDate && endDate 
              ? `Attendance Records (${startDate} to ${endDate})` 
              : "Last 7 Days"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Time In
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Time Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  OT
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  UT
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentData.length > 0 ? (
                currentData.map((day, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm font-medium">
                      {day.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">
                      {day.userId}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {day.timeIn}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {day.timeOut}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {day.hoursWorked}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {day.overtime}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {day.undertime}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      <span className={
                        day.status === "Full Day" 
                          ? "text-emerald-600 dark:text-emerald-400"
                          : day.status.includes("Present")
                          ? "text-green-600 dark:text-green-400"
                          : day.status === "Absent"
                          ? "text-red-600 dark:text-red-400"
                          : "text-orange-600 dark:text-orange-400"
                      }>
                        {day.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No attendance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-muted/50 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, weeklyData.length)} of {weeklyData.length} records
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border rounded-lg transition ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Note */}
      {attendance && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground border">
          <p>
            <strong>Note:</strong> Attendance data is automatically synced from the biometric device. 
            The system deducts 1 hour for lunch if you clocked in before 11:30 AM and out after 1:00 PM.
            {attendance.timeOut === "—" && attendance.timeIn !== "—" && (
              <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ You are currently clocked in. Hours are being calculated in real-time.
              </span>
            )}
          </p>
        </div>
      )}
    </main>
  );
}