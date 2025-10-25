"use client";

import React from "react";
import axios from "axios";
import { DataTable } from "@/components/recruitment-management/applicants/application-data-table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { UserPlusIcon, UsersIcon, UserXIcon, PercentIcon } from "lucide-react";
import { RecentApplicants } from "@/components/recruitment-management/applicants/recent-applicants";
import { DashboardChart } from "@/components/recruitment-management/applicants/dashboard-chart";
import ApplicantsPieChart from "@/components/recruitment-management/applicants/pie-chart";
import ApplicantLineChart from "@/components/recruitment-management/applicants/pie-chart";

interface DashboardData {
    newApplicantsThisMonth: { count: number; change: string };
    rejectedThisMonth: { count: number; change: string };
    totalApplicants: number;
    conversionRate: string;
}

async function getDashboardData(): Promise<DashboardData> {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/dashboard`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            newApplicantsThisMonth: { count: 0, change: "0" },
            rejectedThisMonth: { count: 0, change: "0" },
            totalApplicants: 0,
            conversionRate: "0",
        };
    }
}

export default function Page() {
    const [dashboardData, setDashboardData] = React.useState<DashboardData>({
        newApplicantsThisMonth: { count: 0, change: "0" },
        rejectedThisMonth: { count: 0, change: "0" },
        totalApplicants: 0,
        conversionRate: "0",
    });

    React.useEffect(() => {
        // Poll every 3 seconds for both applicants and dashboard data
        const interval = setInterval(() => {
            getDashboardData().then(setDashboardData);
        }, 3000);

        // Fetch immediately on mount
        getDashboardData().then(setDashboardData);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applicants</span>
                    <span>/</span>
                    <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Applicants Dashboard</h1>
                <p className="text-muted-foreground text-balance">
                    Pipeline for the Applicants
                </p>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden gap-4 pb-8">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium md:text-md">
                                New Applicants <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Total number of applicants for this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.newApplicantsThisMonth.count}</div>
                            <p className="text-xs text-muted-foreground">
                                {parseFloat(dashboardData.newApplicantsThisMonth.change) >= 0
                                    ? `+${dashboardData.newApplicantsThisMonth.change}%`
                                    : `${dashboardData.newApplicantsThisMonth.change}%`}{" "}
                                from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Rejected Applicants <UserXIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Number of rejected this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.rejectedThisMonth.count}</div>
                            <p className="text-xs text-muted-foreground">
                                {parseFloat(dashboardData.rejectedThisMonth.change) >= 0
                                    ? `+${dashboardData.rejectedThisMonth.change}%`
                                    : `${dashboardData.rejectedThisMonth.change}%`}{" "}
                                from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Total Applicants <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Number of total applicants</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalApplicants}</div>
                            <p className="text-xs text-muted-foreground">+22% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Conversion Rate <PercentIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Percentage of applicants who were hired</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.conversionRate}%</div>
                            <p className="text-xs text-muted-foreground">-4% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Pie Chart</CardTitle>
                            <CardDescription>Applicant volume over time</CardDescription>
                        </CardHeader>
                        <CardContent className="">
                            <ApplicantLineChart />
                        </CardContent>
                    </Card>

                    <RecentApplicants />
                </div>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Applicant Overview</CardTitle>
                        <CardDescription>Applicant volume over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <DashboardChart />
                    </CardContent>
                </Card>
            </div>
        </main >
    );
}