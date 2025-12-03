"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, Calendar, TrendingUp, TrendingDown, User } from "lucide-react";

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

export default function UserAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sourceInfo, setSourceInfo] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const fetchAttendance = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = date || selectedDate;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      console.log('🔍 Debug Info:');
      console.log('- API_URL:', API_URL);
      console.log('- Target Date:', targetDate);
      console.log('- Token exists:', !!token);
      console.log('- Token preview:', token?.substring(0, 20) + '...');
      
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
      
      const url = `${API_URL}/employee/attendance?date=${targetDate}&t=${Date.now()}`;
      console.log('- Request URL:', url);
      
      // Call the user-specific attendance endpoint
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include cookies if you're using cookie-based auth
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('- Response status:', res.status);
      console.log('- Response ok:', res.ok);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error Response:', errorData);
        
        if (res.status === 401) {
          throw new Error(errorData.message || "Unauthorized. Please login again.");
        }
        throw new Error(errorData.message || errorData.error || "Failed to fetch attendance data");
      }
      
      const json = await res.json();
      console.log('✅ Success Response:', json);

      setAttendance(json.attendance || null);
      setLastUpdated(new Date().toLocaleString("en-US"));
      
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
      console.error("❌ Fetch error:", err);
      console.error("❌ Error name:", err.name);
      console.error("❌ Error message:", err.message);
      
      // Check if it's a network error
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check if the backend is running on the correct port.");
        setSourceInfo("Connection Error - Server Unreachable");
      } else {
        setError(err.message);
        setSourceInfo("Connection Error");
      }
      
      setAttendance(null);
      setIsInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();

    const interval = setInterval(() => {
      fetchAttendance();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAttendance(newDate);
  };

  const goToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    fetchAttendance(today);
  };

  return (
    <main className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground text-balance">
          View your attendance records and time tracking
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-lg font-semibold">
            {attendance?.date || format(new Date(selectedDate), "MM/dd/yyyy")}
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

        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
            <Calendar className="w-4 h-4 text-muted-foreground" />
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

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isInitialLoad && loading ? (
        <div className="bg-card rounded-xl shadow-lg border p-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading your attendance data...</p>
        </div>
      ) : !attendance ? (
        /* No Data State */
        <div className="bg-card rounded-xl shadow-lg border p-16 text-center">
          <div className="text-muted-foreground space-y-2">
            <Calendar className="w-16 h-16 mx-auto opacity-50" />
            <p className="text-xl font-semibold">No Attendance Record</p>
            <p className="text-sm">You don't have any attendance record for this date.</p>
          </div>
        </div>
      ) : (
        /* Attendance Data Display */
        <>
          {/* Status Card */}
          <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="text-2xl font-bold">{attendance.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">ID: {attendance.userId}</p>
                </div>
                <div className={`text-right ${attendance.statusColor}`}>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold">{attendance.status}</p>
                </div>
              </div>
            </div>

            {/* Time Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
              {/* Time In */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Time In</p>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {attendance.timeIn}
                </p>
              </div>

              {/* Time Out */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Time Out</p>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {attendance.timeOut}
                </p>
              </div>

              {/* Hours Worked */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Hours Worked</p>
                </div>
                <p className="text-2xl font-bold">
                  {attendance.hoursWorked}
                </p>
              </div>

              {/* Total Taps */}
              {attendance.totalTaps !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <p className="text-sm font-medium">Total Taps</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {attendance.totalTaps}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overtime & Undertime Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overtime Card */}
            <div className="bg-card rounded-xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-lg">Overtime</h3>
                </div>
                <div className={`text-3xl font-bold ${
                  attendance.overtime === "—" 
                    ? "text-muted-foreground" 
                    : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {attendance.overtime}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {attendance.overtime === "—" 
                  ? "No overtime recorded" 
                  : "Extra hours worked beyond 8 hours"}
              </p>
            </div>

            {/* Undertime Card */}
            <div className="bg-card rounded-xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-lg">Undertime</h3>
                </div>
                <div className={`text-3xl font-bold ${
                  attendance.undertime === "—" 
                    ? "text-muted-foreground" 
                    : "text-orange-600 dark:text-orange-400"
                }`}>
                  {attendance.undertime}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {attendance.undertime === "—" 
                  ? "No undertime recorded" 
                  : "Hours short of the required 8 hours"}
              </p>
            </div>
          </div>

          {/* Info Note */}
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
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
    </main>
  );
}