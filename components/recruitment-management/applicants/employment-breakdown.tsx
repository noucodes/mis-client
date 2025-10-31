"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Data for the pie chart based on provided employment stages
const data = [
    { name: "Applicants", value: 120 },
    { name: "Initial Interview", value: 80 },
    { name: "Examination", value: 50 },
    { name: "Final Interview", value: 30 },
    { name: "Hired", value: 20 },
];

// Define colors for the pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function EmploymentBreakdown() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Employment Status Breakdown</CardTitle>
                <CardDescription>
                    The breakdown of statuses on employment on the platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default EmploymentBreakdown;