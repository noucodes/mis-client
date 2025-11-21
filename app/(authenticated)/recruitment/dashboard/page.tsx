"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

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

// ── Types ─────────────────────────────────────────────────────────────────────
type MonthData = {
  month: string;
  "Initial Interview": number;
  Examination: number;
  "Final Interview": number;
  Hired: number;
};

type OnboardingData = {
  Applicant: number;
  Shortlisted: number;
  "Not Qualified": number;
  Reject: number;
  Blocklist: number;
};

type UpcomingApplicant = {
  name: string;
  statusValue: string;
  comment: string;
  updatedBy: string;
  statusCreated: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const hiringTrendData: Record<string, MonthData[]> = {
  "2023": months.map((m, i) => ({
    month: m,
    "Initial Interview": 45 + i * 5,
    Examination: 38 + i * 4,
    "Final Interview": 28 + i * 3,
    Hired: 12 + i * 2.5,
  })),
  "2024": months.map((m, i) => ({
    month: m,
    "Initial Interview": 110 + i * 3,
    Examination: 88 + i * 2.8,
    "Final Interview": 68 + i * 2,
    Hired: 44 + i * 1.2,
  })),
  "2025": months.map((m, i) => ({
    month: m,
    "Initial Interview": 160 + i * 3,
    Examination: 128 + i * 2.7,
    "Final Interview": 98 + i * 2,
    Hired: 62 + i * 1.3,
  })),
  "2026": months.map((m, i) => ({
    month: m,
    "Initial Interview": 210 + i * 4,
    Examination: 168 + i * 3.2,
    "Final Interview": 128 + i * 2.5,
    Hired: 82 + i * 1.5,
  })),
};

const onboardingByMonth: Record<string, Record<string, OnboardingData>> = {
  "2025": {
    "December": { Applicant: 480, Shortlisted: 340, "Not Qualified": 90, Reject: 42, Blocklist: 8 },
    "November": { Applicant: 465, Shortlisted: 332, "Not Qualified": 88, Reject: 40, Blocklist: 8 },
    "October":  { Applicant: 450, Shortlisted: 325, "Not Qualified": 85, Reject: 38, Blocklist: 7 },
    "September":{ Applicant: 440, Shortlisted: 320, "Not Qualified": 82, Reject: 36, Blocklist: 7 },
    "August":   { Applicant: 430, Shortlisted: 315, "Not Qualified": 80, Reject: 35, Blocklist: 6 },
    "July":     { Applicant: 420, Shortlisted: 310, "Not Qualified": 78, Reject: 34, Blocklist: 6 },
    "June":     { Applicant: 410, Shortlisted: 305, "Not Qualified": 76, Reject: 33, Blocklist: 6 },
    "May":      { Applicant: 400, Shortlisted: 300, "Not Qualified": 74, Reject: 32, Blocklist: 5 },
    "April":    { Applicant: 390, Shortlisted: 295, "Not Qualified": 72, Reject: 31, Blocklist: 5 },
    "March":    { Applicant: 380, Shortlisted: 290, "Not Qualified": 70, Reject: 30, Blocklist: 5 },
    "February": { Applicant: 370, Shortlisted: 285, "Not Qualified": 68, Reject: 29, Blocklist: 5 },
    "January":  { Applicant: 360, Shortlisted: 280, "Not Qualified": 66, Reject: 28, Blocklist: 5 },
  },
  "default": {
    "December": { Applicant: 480, Shortlisted: 340, "Not Qualified": 90, Reject: 42, Blocklist: 8 },
  },
};

// ── Sample Upcoming Applicants ───────────────────────────────────────────────
const upcomingApplicants: UpcomingApplicant[] = [
  {
    name: "fsdfsda",
    statusValue: "Rejected",
    comment: "Elton John Escudero",
    updatedBy: "Human Resource",
    statusCreated: "Nov 20, 2025",
  },
  {
    name: "DKLAJAJS",
    statusValue: "Applied",
    comment: "Elton John Escudero",
    updatedBy: "Human Resource",
    statusCreated: "Nov 19, 2025",
  },
];

export default function Page() {
  const [selectedYear, setSelectedYear] = React.useState("2025");
  const [selectedMonth, setSelectedMonth] = React.useState("December");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentMonthData =
    hiringTrendData[selectedYear]?.find((m) => m.month === selectedMonth) ||
    hiringTrendData[selectedYear]?.[11] ||
    hiringTrendData["2025"][11];

  const currentOnboarding =
    onboardingByMonth[selectedYear]?.[selectedMonth] ||
    onboardingByMonth["default"]["December"];

  const pieData = [
    { name: "Applicant",       value: currentOnboarding.Applicant,       color: "#3b82f6" },
    { name: "Shortlisted",     value: currentOnboarding.Shortlisted,     color: "#10b981" },
    { name: "Not Qualified",   value: currentOnboarding["Not Qualified"], color: "#f59e0b" },
    { name: "Reject",          value: currentOnboarding.Reject,          color: "#ef4444" },
    { name: "Blocklist",       value: currentOnboarding.Blocklist,       color: "#6b7280" },
  ];

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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{currentOnboarding.Applicant}</div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-green-600">{currentOnboarding.Shortlisted}</div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Hired ({selectedMonth})</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-emerald-600">{currentMonthData.Hired}</div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-red-600">{currentOnboarding.Reject}</div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Not Qualified</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-amber-600">{currentOnboarding["Not Qualified"]}</div></CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Shortlist Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">
            {Math.round((currentOnboarding.Shortlisted / currentOnboarding.Applicant) * 100)}%
          </div></CardContent>
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
              <LineChart data={hiringTrendData[selectedYear]} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "white" }} />
                <RechartsLegend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="Initial Interview" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Examination"       stroke="#8b5cf6" strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Final Interview"   stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Hired"             stroke="#10b981" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
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
                {filteredApplicants.map((applicant, i) => (
                  <tr
                    key={i}
                    className="bg-white shadow-sm rounded-lg transition-all hover:scale-[1.01] hover:shadow-md"
                  >
                    <td className="px-4 py-3">{applicant.name}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          applicant.statusValue.toLowerCase() === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {applicant.statusValue}
                      </span>
                    </td>
                    <td className="px-4 py-3">{applicant.comment}</td>
                    <td className="px-4 py-3">{applicant.updatedBy}</td>
                    <td className="px-4 py-3">{applicant.statusCreated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
