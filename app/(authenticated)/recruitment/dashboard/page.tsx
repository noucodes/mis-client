"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { UserPlus } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface RecruitmentKPIs {
  total_applicants: number;
  shortlisted: number;
  hired: number;
  rejected: number;
  not_qualified: number;
  blocklisted: number;
  shortlist_rate: number;
}

interface OnboardingData {
  Applicant: number;
  Shortlisted: number;
  "Not Qualified": number;
  Reject: number;
  Blocklist: number;
}

interface MonthData {
  month: string;
  "Initial Interview": number;
  Examination: number;
  "Final Interview": number;
  Hired: number;
}

interface UpcomingApplicant {
  name: string;
  statusValue: string;
  comment: string;
  updatedBy: string;
  statusCreated: string;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Page() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.toLocaleString("en-US", { month: "long" }) // e.g. "November"
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Real data from backend
  const [kpis, setKpis] = useState<RecruitmentKPIs | null>(null);
  const [pipelineData, setPipelineData] = useState<OnboardingData | null>(null);
  const [trendData, setTrendData] = useState<MonthData[]>([]);
  const [upcomingApplicants, setUpcomingApplicants] = useState<UpcomingApplicant[]>([]);

  // Fetch all data when year/month changes
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, pipelineRes, trendRes, upcomingRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/recruitment-kpis`, {
            params: { year: selectedYear, month: selectedMonth },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/onboarding-pipeline`, {
            params: { year: selectedYear, month: selectedMonth },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/hiring-trend`, {
            params: { year: selectedYear },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/applicant-status-history`),
        ]);

        setKpis(kpiRes.data);
        setPipelineData(pipelineRes.data);
        setTrendData(trendRes.data);
        setUpcomingApplicants(upcomingRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    fetchAll();
  }, [selectedYear, selectedMonth]);

  // Pie chart data (from real pipeline)
  const pieData = pipelineData
    ? [
      { name: "Applicant", value: pipelineData.Applicant, color: "#3b82f6" },
      { name: "Shortlisted", value: pipelineData.Shortlisted, color: "#10b981" },
      { name: "Not Qualified", value: pipelineData["Not Qualified"], color: "#f59e0b" },
      { name: "Reject", value: pipelineData.Reject, color: "#ef4444" },
      { name: "Blocklist", value: pipelineData.Blocklist, color: "#6b7280" },
    ]
    : [];

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 16}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke={fill}
          strokeWidth={4}
          style={{ filter: `drop-shadow(0 0 20px ${fill}99)` }}
        />
      </g>
    );
  };

  const filteredApplicants = upcomingApplicants.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background p-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Dashboard</h1>
          <p className="text-muted-foreground">Real-time onboarding and hiring performance</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Total Applicants <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.total_applicants ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Shortlisted <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpis?.shortlisted ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Hired ({selectedMonth}) <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.hired ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Rejected <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.rejected ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Not Qualified <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.not_qualified ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">Shortlist Rate <UserPlus className="h-5 w-5 text-muted-foreground" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpis?.shortlist_rate != null ? `${kpis.shortlist_rate}%` : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Onboarding Pipeline */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Onboarding Pipeline</CardTitle>
            <CardDescription>Current status • {selectedMonth} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
              <div className="flex-1 min-w-[320px] max-w-[380px]">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={84} outerRadius={132}
                      paddingAngle={4}
                      activeIndex={activeIndex ?? undefined}
                      activeShape={renderActiveShape}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={4}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setActiveIndex(i)}
                          onMouseLeave={() => setActiveIndex(null)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 max-w-[260px] space-y-6 ml-6">
                {pieData.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 cursor-pointer"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className="w-6 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                      style={{
                        backgroundColor: entry.color,
                        transform: activeIndex === i ? "scale(1.35)" : "scale(1)",
                        boxShadow: activeIndex === i ? `0 0 20px ${entry.color}99` : "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{entry.name}</p>
                      <p className="text-xl font-semibold">{entry.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Trend */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Hiring Trend</CardTitle>
            <CardDescription>Monthly progression • {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "white" }} />
                <RechartsLegend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="Initial Interview" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Examination" stroke="#8b5cf6" strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Final Interview" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Hired" stroke="#10b981" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Onboarding Table */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold mb-2 md:mb-0">Upcoming Onboarding Applicants</CardTitle>
          <input
            type="text"
            placeholder="Search applicant..."
            className="border rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto border-separate border-spacing-y-2">
              <thead>
                <tr className="text-sm text-gray-500 uppercase">
                  <th className="px-4 py-2">Applicant Name</th>
                  <th className="px-4 py-2">Status Value</th>
                  <th className="px-4 py-2">Comment</th>
                  <th className="px-4 py-2">Updated By</th>
                  <th className="px-4 py-2">Status Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No applicants found
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant, i) => (
                    <tr
                      key={i}
                      className="bg-white shadow-sm rounded-lg transition-all hover:scale-[1.01] hover:shadow-md"
                    >
                      <td className="px-4 py-3">{applicant.name}</td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.statusValue.toLowerCase() === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                            }`}
                        >
                          {applicant.statusValue}
                        </span>
                      </td>
                      <td className="px-4 py-3">{applicant.comment || "-"}</td>
                      <td className="px-4 py-3">{applicant.updatedBy}</td>
                      <td className="px-4 py-3">{applicant.statusCreated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main >
  );
}