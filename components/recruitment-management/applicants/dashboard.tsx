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
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];

interface DashboardMetrics {
  newApplicantsThisMonth: { count: number; change: string };
  rejectedThisMonth: { count: number; change: string };
  totalApplicants: number;
  conversionRate: number | string;
}

interface RecentApplicant {
  id: number;
  name: string;
  status: string;
  appliedAgo: string;
}

interface SourceItem {
  name: string;
  value: number;
}

interface MonthlyItem {
  month: string;
  hired: number;
  rejected: number;
}

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [sourcesData, setSourcesData] = useState<SourceItem[]>([]);
  const [chartData, setChartData] = useState<MonthlyItem[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch everything once
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [metrics, sources, monthly, recent] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/dashboard-metrics`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/applicant-sources`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/monthly-hired-rejected?year=${selectedYear}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/recent-applicants`),
        ]);

        setDashboardData(metrics.data);
        setSourcesData(sources.data);
        setChartData(monthly.data);
        setRecentApplicants(recent.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedYear]);

  const totalApplicants = sourcesData.reduce((acc, cur) => acc + cur.value, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Offer Extended": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Interview Scheduled": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "Rejected": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  return (
    <>
      {/* Header - unchanged */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Applicants</span> / <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants Dashboard</h1>
        <p className="text-muted-foreground">Pipeline overview and performance metrics</p>
      </div>

      <div className="grid gap-6">
        {/* Stats Cards - same design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                New Applicants <UserPlus className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData?.newApplicantsThisMonth.count ?? 0}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                +{dashboardData?.newApplicantsThisMonth.change ?? "0"}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Rejected <UserX className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData?.rejectedThisMonth.count ?? 0}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {dashboardData?.rejectedThisMonth.change ?? "0"}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Total Applicants <Users className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData?.totalApplicants.toLocaleString() ?? 0}
              </div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                +22% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Conversion Rate <Percent className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Hired / Applied</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData?.conversionRate ? Number(dashboardData.conversionRate).toFixed(1) : "0"}%
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                -4% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - 100% same design */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Applicant Sources - exact same pie + legend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Applicant Sources</CardTitle>
              <CardDescription>Where applicants come from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
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
                          const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
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
                          <Cell key={`cell-${index}`} fill={COLORS[index]} style={{ transition: "all 0.3s ease", cursor: "pointer" }} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-3 w-full">
                  {sourcesData.map((item, index) => {
                    const percentage = ((item.value / totalApplicants) * 100).toFixed(1);
                    const isActive = activeIndex === index;

                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all cursor-pointer ${isActive
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
                        <span className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applicants - same design, real data */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Applicants</CardTitle>
              <CardDescription>Latest applicants in the pipeline</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {recentApplicants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No applicants found</p>
                ) : (
                  recentApplicants.map((applicant) => (
                    <div key={applicant.id} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {applicant.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{applicant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {formatDistanceToNow(new Date(applicant.appliedAgo), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - exact same, real data */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hired vs Rejected Applicants</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickMargin={10} />
                  <YAxis tickLine={false} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "#e5e7eb",
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