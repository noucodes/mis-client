"use client";

import React, { useEffect, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, XAxis, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface DashboardData {
  totalOnboardings: number;
  fullyOnboarded: number;
  inProgress: number;
  pending: number;
  monthlyHires: { month: string; hires: number }[];
  taskCompletion: { task: string; task_id: string; completion_rate: number }[];
  recentActivities: { name: string; task: string; timeAgoRaw: string; timeAgo?: string; }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/onboarding-dashboard`)
      .then(res => {
        const rawData = res.data;

        // Format time for Recent Activities
        const formattedActivities = rawData.recentActivities.map((activity: { name: string; task: string; timeAgoRaw: string }) => ({
          ...activity,
          timeAgo: formatDistanceToNow(new Date(activity.timeAgoRaw), { addSuffix: true })
        }));

        setData({
          ...rawData,
          recentActivities: formattedActivities
        });
      })
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="p-10 text-center">Loading onboarding dashboard...</div>;
  }

  const onboardingStats = [
    { name: "Fully Onboarded", value: data.fullyOnboarded, color: "#10b981" },
    { name: "In Progress", value: data.inProgress, color: "#0ea5e9" },
    { name: "Pending", value: data.pending, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Your exact beautiful layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Onboarding Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center pb-5">
            <CardTitle className="text-xl md:text-2xl">Onboarding Status</CardTitle>
            <CardDescription className="text-base md:text-lg">
              Current progress of all new hires
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={onboardingStats}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {onboardingStats.map((entry, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <Cell
                        key={`cell-${i}`}
                        fill={entry.color}
                        cursor="pointer"
                        stroke={entry.color}
                        strokeWidth={isActive ? 6 : 0}
                        style={{
                          filter: isActive ? `drop-shadow(0 0 10px ${entry.color})` : undefined,
                          transition: "all 0.3s ease-out",
                        }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-6 mt-4 w-full max-w-md text-base">
              {onboardingStats.map((s, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={s.name}
                    className={`text-center cursor-pointer transition-transform ${isActive ? "scale-105" : ""}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className="text-sm md:text-base mt-1 font-medium">{s.name}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Task Completion Rate</CardTitle>
            <CardDescription className="text-base md:text-lg">Percentage of completed onboarding tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.taskCompletion.map((t) => (
              <div key={t.task_id} className="flex items-center gap-4">
                <span className="text-base font-medium text-muted-foreground w-36">
                  {t.task}
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${t.completion_rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-14 text-right text-emerald-600">
                    {t.completion_rate}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hires Chart + Recent Activities */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Hires per Month</CardTitle>
            <CardDescription className="text-base md:text-lg">New hires this year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthlyHires} margin={{ top: 0, right: 30, left: 20, bottom: 30 }}>
                <defs>
                  <linearGradient id="fillHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} interval={0} angle={-25} textAnchor="end" height={40} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="hires"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#fillHires)"
                  dot={{ fill: "#0EA5E9" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Recent Activities</CardTitle>
            <CardDescription className="text-base md:text-lg">Live onboarding task completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-base table-auto">
                <thead className="border-b border-border/60 text-center">
                  <tr>
                    <th className="py-3 font-medium w-1/5">New Hire</th>
                    <th className="py-3 font-medium w-1/5">Task</th>
                    <th className="py-3 font-medium w-1/5">Status</th>
                    <th className="py-3 font-medium w-1/8">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.recentActivities.map((a, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 text-center font-medium">{a.name}</td>
                      <td className="py-3 text-base">{a.task}</td>
                      <td className="py-3 text-base">
                        <span className="text-emerald-600 font-medium">Completed</span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{a.timeAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 