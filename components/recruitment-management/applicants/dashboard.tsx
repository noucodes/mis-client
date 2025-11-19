"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, UserX, Users, Percent } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Sector,
} from "recharts";

// === Data ===
const sourcesData = [
  { name: "LinkedIn", value: 38 },
  { name: "Company Website", value: 25 },
  { name: "Job Board", value: 18 },
  { name: "Referral", value: 12 },
  { name: "Others", value: 7 },
];

const COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];

type Year = "2024" | "2025" | "2026";

const dataByYear: Record<
  Year,
  Array<{ month: string; hired: number; rejected: number }>
> = {
  "2024": [
    { month: "Jan", hired: 8, rejected: 35 },
    { month: "Feb", hired: 12, rejected: 38 },
    { month: "Mar", hired: 14, rejected: 42 },
    { month: "Apr", hired: 18, rejected: 30 },
    { month: "May", hired: 22, rejected: 28 },
    { month: "Jun", hired: 25, rejected: 26 },
    { month: "Jul", hired: 28, rejected: 24 },
    { month: "Aug", hired: 32, rejected: 22 },
    { month: "Sep", hired: 36, rejected: 20 },
    { month: "Oct", hired: 38, rejected: 23 },
    { month: "Nov", hired: 40, rejected: 25 },
    { month: "Dec", hired: 44, rejected: 21 },
  ],
  "2025": [
    { month: "Jan", hired: 12, rejected: 28 },
    { month: "Feb", hired: 19, rejected: 32 },
    { month: "Mar", hired: 15, rejected: 41 },
    { month: "Apr", hired: 22, rejected: 18 },
    { month: "May", hired: 28, rejected: 25 },
    { month: "Jun", hired: 31, rejected: 22 },
    { month: "Jul", hired: 35, rejected: 19 },
    { month: "Aug", hired: 38, rejected: 23 },
    { month: "Sep", hired: 42, rejected: 20 },
    { month: "Oct", hired: 40, rejected: 26 },
    { month: "Nov", hired: 37, rejected: 30 },
    { month: "Dec", hired: 45, rejected: 24 },
  ],
  "2026": [
    { month: "Jan", hired: 48, rejected: 22 },
    { month: "Feb", hired: 52, rejected: 20 },
    { month: "Mar", hired: 55, rejected: 18 },
    { month: "Apr", hired: 58, rejected: 16 },
    { month: "May", hired: 62, rejected: 15 },
    { month: "Jun", hired: 65, rejected: 14 },
    { month: "Jul", hired: 68, rejected: 13 },
    { month: "Aug", hired: 70, rejected: 12 },
    { month: "Sep", hired: 74, rejected: 11 },
    { month: "Oct", hired: 78, rejected: 10 },
    { month: "Nov", hired: 82, rejected: 9 },
    { month: "Dec", hired: 88, rejected: 8 },
  ],
};

const dashboardData = {
  newApplicantsThisMonth: { count: 184, change: "28.4" },
  rejectedThisMonth: { count: 23, change: "-12.1" },
  totalApplicants: 1287,
  conversionRate: 18.7,
};

// === Recent Applicants ===
const RecentApplicants = () => (
  <Card className="lg:col-span-2">
    <CardHeader>
      <CardTitle>Recent Applicants</CardTitle>
      <CardDescription>Latest applicants in the pipeline</CardDescription>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {[
          { name: "Sarah Chen", status: "In Review" },
          { name: "Michael Torres", status: "Interview Scheduled" },
          { name: "Emma Williams", status: "Offer Extended" },
          { name: "James Liu", status: "In Review" },
          { name: "Aisha Patel", status: "Rejected" },
          { name: "John Doe", status: "In Review" },
          { name: "Jane Smith", status: "Offer Extended" },
          { name: "Robert Brown", status: "Interview Scheduled" },
          { name: "Lucy Green", status: "Rejected" },
        ].map((applicant, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {applicant.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{applicant.name}</p>
              <p className="text-xs text-muted-foreground">Applied 2 days ago</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                applicant.status === "Offer Extended"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : applicant.status === "Interview Scheduled"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : applicant.status === "Rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              }`}
            >
              {applicant.status}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// === Dashboard Component ===
export function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<Year>("2025");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = dataByYear[selectedYear];
  const totalApplicants = sourcesData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Applicants</span> /{" "}
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants Dashboard</h1>
        <p className="text-muted-foreground">
          Pipeline overview and performance metrics
        </p>
      </div>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                New Applicants <UserPlus className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.newApplicantsThisMonth.count}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                +{dashboardData.newApplicantsThisMonth.change}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Rejected <UserX className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.rejectedThisMonth.count}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {dashboardData.rejectedThisMonth.change}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Total Applicants <Users className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.totalApplicants.toLocaleString()}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                +22% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Conversion Rate <Percent className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Hired / Applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.conversionRate}%</div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                -4% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Applicant Sources */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Applicant Sources</CardTitle>
              <CardDescription>Where applicants come from</CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="flex-1 min-w-[220px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourcesData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        activeIndex={activeIndex ?? undefined}
                        activeShape={(props: any) => {
                          const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
                            props;
                          return (
                            <g>
                              <Sector
                                cx={cx}
                                cy={cy}
                                innerRadius={innerRadius}
                                outerRadius={outerRadius + 12}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                fill={fill}
                                style={{
                                  filter: `drop-shadow(0 8px 24px ${fill}70)`,
                                  transition: "all 0.3s ease",
                                }}
                              />
                            </g>
                          );
                        }}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {sourcesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index]}
                            style={{
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 flex flex-col justify-center gap-3 w-full">
                  {sourcesData.map((item, index) => {
                    const percentage = ((item.value / totalApplicants) * 100).toFixed(1);
                    const isActive = activeIndex === index;

                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? "bg-muted/80 shadow-lg ring-2 ring-primary/30 scale-105"
                            : "hover:bg-muted/40"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full transition-transform"
                            style={{
                              backgroundColor: COLORS[index],
                              transform: isActive ? "scale(1.6)" : "scale(1)",
                            }}
                          />
                          <span className={`font-medium ${isActive ? "font-bold" : ""}`}>
                            {item.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applicants */}
          <RecentApplicants />

          {/* Bar Chart */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hired vs Rejected Applicants</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </div>
              <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v as Year)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickMargin={10} />
                  <YAxis tickLine={false} />
                  <Tooltip
                    cursor={false} // removes hover background
                    contentStyle={{
                      backgroundColor: "#e5e7eb", // gray background
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hired" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Hired" />
                  <Bar dataKey="rejected" fill="#f97316" radius={[8, 8, 0, 0]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
