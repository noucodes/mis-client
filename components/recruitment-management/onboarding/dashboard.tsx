"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Data
const chartData = [
  { month: "Jan", hires: 306 },
  { month: "Feb", hires: 485 },
  { month: "Mar", hires: 397 },
  { month: "Apr", hires: 163 },
  { month: "May", hires: 349 },
  { month: "Jun", hires: 364 },
  { month: "Jul", hires: 430 },
  { month: "Aug", hires: 480 },
  { month: "Sep", hires: 520 },
  { month: "Oct", hires: 491 },
  { month: "Nov", hires: 453 },
  { month: "Dec", hires: 570 },
];

const onboardingStats = [
  { name: "Fully Onboarded", value: 48, color: "#10b981" },
  { name: "In Progress", value: 32, color: "#0ea5e9" },
  { name: "Pending", value: 20, color: "#f59e0b" },
];

const taskCompletion = [
  { task: "Orientation", completed: 98 },
  { task: "Google Account", completed: 97 },
  { task: "Documents", completed: 94 },
  { task: "Asset Assignment", completed: 88 },
  { task: "Biometric", completed: 91 },
  { task: "Time Doctor", completed: 85 },
];

const recentOnboardingActivities = [
  { id: 1, name: "Joe Does", task: "Biometric Enrollment", timeAgo: "Just now" },
  { id: 2, name: "Joe Does", task: "Asset Assignment", timeAgo: "2 minutes ago" },
  { id: 3, name: "Joe Does", task: "Documents Submitted", timeAgo: "5 minutes ago" },
  { id: 4, name: "Sarah Chen", task: "Time Doctor Setup", timeAgo: "12 minutes ago" },
  { id: 5, name: "Joe Does", task: "Google Account Creation", timeAgo: "18 minutes ago" },
  { id: 6, name: "Michael Torres", task: "Orientation Completed", timeAgo: "1 hour ago" },
  { id: 7, name: "Emma Williams", task: "Documents Submitted", timeAgo: "2 hours ago" },
];

// Metric Card Component
function MetricCard({
  icon: Icon,
  title,
  value,
  change,
  changeType = "positive",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  change: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
      ? "text-red-600"
      : "text-muted-foreground";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-base font-semibold text-foreground/90">
            {title}
          </CardDescription>
          <Icon className="h-5 w-5 text-muted-foreground/70" />
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold mt-2 text-foreground">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-sm md:text-base font-medium ${changeColor}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Custom active shape with glow + scale
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <defs>
          <filter id={`glow-${fill.replace("#", "")}`}>
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feFlood floodColor={fill} floodOpacity="0.6" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M${cx},${cy}
             L${cx + Math.cos((startAngle * Math.PI) / 180) * outerRadius},${cx + Math.sin((startAngle * Math.PI) / 180) * outerRadius}
             A${outerRadius},${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1
             ${cx + Math.cos((endAngle * Math.PI) / 180) * outerRadius},${cy + Math.sin((endAngle * Math.PI) / 180) * outerRadius}
             L${cx + Math.cos((endAngle * Math.PI) / 180) * innerRadius},${cy + Math.sin((endAngle * Math.PI) / 180) * innerRadius}
             A${innerRadius},${innerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},0
             ${cx + Math.cos((startAngle * Math.PI) / 180) * innerRadius},${cy + Math.sin((startAngle * Math.PI) / 180) * innerRadius}
             Z`}
          fill={fill}
          stroke={fill}
          strokeWidth={4}
          style={{
            filter: `url(#glow-${fill.replace("#", "")})`,
            transform: "scale(1.08)",
            transformOrigin: `${cx}px ${cy}px`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pt-0">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard icon={CheckCircle} title="Completed Tasks" value="342" change="+12.5% this month" changeType="positive" />
        <MetricCard icon={Clock} title="In Progress" value="28" change="+2 new today" changeType="positive" />
        <MetricCard icon={Users} title="Team Members" value="12" change="All active" changeType="neutral" />
        <MetricCard icon={TrendingUp} title="Success Rate" value="94.3%" change="+3.2% improvement" changeType="positive" />
        <MetricCard icon={BarChart3} title="Total Revenue" value="$28.5K" change="+18% vs last month" changeType="positive" />
        <MetricCard icon={Zap} title="Performance" value="98%" change="-1% from peak" changeType="negative" />
      </div>

      {/* Hires Chart + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hires per Month */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Hires per Month</CardTitle>
            <CardDescription className="text-base md:text-lg">New hires this year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="hires"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#fillHires)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Recent Activities</CardTitle>
            <CardDescription className="text-base md:text-lg">Live onboarding task completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-base table-auto">
                <thead className="border-b border-border/60">
                  <tr>
                    <th className="text-left py-3 font-medium w-2/5">New Hire</th>
                    <th className="text-left py-3 font-medium w-1/5">Task</th>
                    <th className="text-left py-3 font-medium w-1/5">Status</th>
                    <th className="text-left py-3 font-medium w-1/5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOnboardingActivities.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-sky-500/20 text-sky-600 text-sm font-medium">
                              {a.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-base">{a.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {a.name.toLowerCase().replace(" ", ".")}@company.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-base">{a.task}</td>
                      <td className="py-3">
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarding Status - FIXED & BEAUTIFUL */}
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="text-center pb-5">
            <CardTitle className="text-xl md:text-2xl">Onboarding Status</CardTitle>
            <CardDescription className="text-base md:text-lg">
              Current progress of all new hires
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={onboardingStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  activeIndex={activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {onboardingStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={3}
                      style={{
                        transition: "all 0.4s ease",
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Interactive Legend */}
            <div className="grid grid-cols-3 gap-8 mt-8 w-full max-w-lg">
              {onboardingStats.map((s, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={s.name}
                    className="text-center cursor-pointer"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className="text-4xl font-bold transition-all duration-300"
                      style={{
                        color: s.color,
                        textShadow: isActive ? `0 0 24px ${s.color}80` : "none",
                        transform: isActive ? "translateY(-6px)" : "translateY(0)",
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="mt-2 text-sm font-medium transition-colors"
                      style={{
                        color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {s.name}
                    </div>
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
            <CardDescription className="text-base md:text-lg">
              Percentage of completed onboarding tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {taskCompletion.map((t) => (
              <div key={t.task} className="flex items-center gap-4">
                <span className="text-base font-medium text-muted-foreground w-40">
                  {t.task}
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${t.completed}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-14 text-right text-emerald-600">
                    {t.completed}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}