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
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Page() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.toLocaleString("en-US", { month: "long" }) // e.g. "November"
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [kpis, setKpis] = useState<any>(null);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [upcomingApplicants, setUpcomingApplicants] = useState<any[]>([]);

  const [chartSizes, setChartSizes] = useState({
    innerRadius: 80,
    outerRadius: 130,
    height: 350,
    legendPosition: "right" as "right" | "bottom",
    compactLegend: false,
  });

  // Handle responsive chart sizing
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setChartSizes({ innerRadius: 50, outerRadius: 80, height: 280, legendPosition: "bottom", compactLegend: true });
      } else if (w < 1024) {
        setChartSizes({ innerRadius: 70, outerRadius: 110, height: 320, legendPosition: "bottom", compactLegend: false });
      } else {
        setChartSizes({ innerRadius: 80, outerRadius: 130, height: 380, legendPosition: "right", compactLegend: false });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data
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
        console.error("Failed to load dashboard", err);
      }
    };
    fetchAll();
  }, [selectedYear, selectedMonth]);

  const pieData = pipelineData ? [
    { name: "Applicant", value: pipelineData.Applicant, color: "#3b82f6" },
    { name: "Shortlisted", value: pipelineData.Shortlisted, color: "#10b981" },
    { name: "Not Qualified", value: pipelineData["Not Qualified"], color: "#f59e0b" },
    { name: "Reject", value: pipelineData.Reject, color: "#ef4444" },
    { name: "Blocklist", value: pipelineData.Blocklist, color: "#6b7280" },
  ] : [];

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 14}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const filteredApplicants = upcomingApplicants.filter((a: any) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recruitment Dashboard</h1>
          <p className="text-muted-foreground">Real-time employment status & hiring performance</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2023","2024","2025","2026"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Applicants", value: kpis?.total_applicants ?? 0 },
          { label: "Shortlisted", value: kpis?.shortlisted ?? 0 },
          { label: `Hired (${selectedMonth})`, value: kpis?.hired ?? 0 },
          { label: "Rejected", value: kpis?.rejected ?? 0 },
          { label: "Not Qualified", value: kpis?.not_qualified ?? 0 },
          { label: "Shortlist Rate", value: kpis?.shortlist_rate != null ? `${kpis.shortlist_rate}%` : "0%" },
        ].map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                {item.label}
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{item.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie chart: Employment Status - FIXED & FULLY RESPONSIVE */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Employment Status</CardTitle>
            <CardDescription>{selectedMonth} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex ${chartSizes.legendPosition === "bottom" ? "flex-col" : "flex-col lg:flex-row"} items-center justify-center gap-6`}>
              {/* Pie Chart */}
              <div className="w-full max-w-[400px]">
                <ResponsiveContainer width="100%" height={chartSizes.height}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={chartSizes.innerRadius}
                      outerRadius={chartSizes.outerRadius}
                      paddingAngle={5}
                      activeIndex={activeIndex !== null ? activeIndex : undefined}
                      activeShape={renderActiveShape}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={activeIndex === index ? entry.color : "#fff"}
                          strokeWidth={activeIndex === index ? 6 : 3}
                          style={{ outline: "none", cursor: "pointer" }}
                          onMouseEnter={() => setActiveIndex(index)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className={`grid ${chartSizes.compactLegend ? "grid-cols-2 gap-x-6 gap-y-3" : "grid-cols-1"} gap-y-4 w-full lg:w-auto`}>
                {pieData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className="w-5 h-5 rounded-full transition-all duration-200 flex-shrink-0"
                      style={{
                        backgroundColor: entry.color,
                        transform: activeIndex === index ? "scale(1.4)" : "scale(1)",
                        boxShadow: activeIndex === index ? `0 0 16px ${entry.color}99` : "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <div>
                      <p className={`font-medium ${chartSizes.compactLegend ? "text-xs" : "text-sm"} text-muted-foreground`}>
                        {entry.name}
                      </p>
                      <p className={`font-bold ${chartSizes.compactLegend ? "text-lg" : "text-xl"}`}>
                        {entry.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Trend - unchanged */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Hiring Trend</CardTitle>
            <CardDescription>{selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-40} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <RechartsLegend />
                  <Line type="monotone" dataKey="Initial Interview" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Examination" stroke="#8b5cf6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Final Interview" stroke="#f59e0b" strokeWidth={3} />
                  <Line type="monotone" dataKey="Hired" stroke="#10b981" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Applicants Table - unchanged */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">Status History</CardTitle>
          <input
            type="text"
            placeholder="Search applicant..."
            className="border rounded-lg px-3 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-sm text-gray-500 uppercase">
                  {["Applicant Name","Status","Comment","Updated By","Status Created"].map((h, idx) => (
                    <th key={idx} className="px-3 py-2 whitespace-nowrap">{h}</th>
                  ))}
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
                  filteredApplicants.map((a, i) => (
                    <tr key={i} className="bg-white shadow-sm rounded-lg hover:shadow-md transition">
                      <td className="px-3 py-2 whitespace-nowrap">{a.name}</td>
                      <td className="px-3 py-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          a.statusValue?.toLowerCase() === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          {a.statusValue}
                        </span>
                      </td>
                      <td className="px-3 py-2">{a.comment || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{a.updatedBy}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{a.statusCreated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}