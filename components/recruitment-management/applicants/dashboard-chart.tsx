"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts";

interface ChartData {
    name: string;
    hired: number;
    rejected: number;
}

export function DashboardChart() {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            console.log("🟢 [DashboardChart] Fetching applicant status data...");

            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

                console.log("🔹 [DashboardChart] API URL:", baseUrl);
                console.log("🔹 [DashboardChart] Token found:", token ? "✅ yes" : "❌ no");

                const response = await axios.get(`${baseUrl}/reports/applicants-by-status`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        startDate: "2025-01-01",
                        endDate: "2025-12-31",
                    },
                });

                console.log("🟢 [DashboardChart] Raw API Response:", response);

                const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];

                console.log("🔹 [DashboardChart] Extracted Data:", rawData);

                const months = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ];

                const fullData = months.map((month) => {
                    const found = rawData.find((item: any) => item.name === month);
                    const obj = {
                        name: month,
                        hired: Number(found?.hired || 0),
                        rejected: Number(found?.rejected || 0),
                    };
                    console.log(`📊 [DashboardChart] Month: ${month}`, obj);
                    return obj;
                });

                console.log("✅ [DashboardChart] Final chart data:", fullData);

                setData(fullData);
            } catch (err: any) {
                console.error("❌ [DashboardChart] Error fetching chart data:", err);
                setError("Failed to load chart data");
            } finally {
                setLoading(false);
                console.log("🔚 [DashboardChart] Fetch process completed.");
            }
        };

        fetchData();
    }, []);

    if (loading) {
        console.log("⏳ [DashboardChart] Loading chart...");
        return (
            <div className="h-[350px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart...</p>
            </div>
        );
    }

    if (error) {
        console.log("🚨 [DashboardChart] Error displayed:", error);
        return (
            <div className="h-[350px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    console.log("📈 [DashboardChart] Rendering chart with data:", data);

    return (
        <div className="h-[350px] w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={350}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => `${value}`}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hired" fill="#22c55e" radius={[4, 4, 0, 0]} name="Hired" />
                    <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}