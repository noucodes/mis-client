"use client";

import React from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { UserPlusIcon, UsersIcon, UserXIcon, PercentIcon } from "lucide-react";
import { DashboardChart } from "@/components/recruitment-management/applicants/dashboard-chart";
import { ApplicationFunnel } from "@/components/recruitment-management/applicants/applicantion-funnel";
import { EmploymentBreakdown } from "@/components/recruitment-management/applicants/employment-breakdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentStatusTable } from "@/components/recruitment-management/applicants/recent-status-table";
import { StatusHistory, columns } from "../applicants/status/columns";

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

const applicants = [
    {
        applicant_id: 1,
        full_name: "John Doe",
        interview_date: "2025-10-28T10:00:00Z",
        status: "examination",
    },
    {
        applicant_id: 2,
        full_name: "Jane Smith",
        interview_date: "2025-10-29T14:30:00Z",
        status: "final interview",
    },
    {
        applicant_id: 3,
        full_name: "Alex Johnson",
        interview_date: "2025-10-30T09:00:00Z",
        status: "examination",
    },
    {
        applicant_id: 4,
        full_name: "Emily Davis",
        interview_date: "2025-11-01T11:15:00Z",
        status: "final interview",
    },
    {
        applicant_id: 5,
        full_name: "Michael Brown",
        interview_date: "2025-10-31T16:00:00Z",
        status: "examination",
    },
];

async function getData(): Promise<StatusHistory[]> {
    try {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : "";

        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/status/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // axios stores data in res.data (no need for res.json())
        const data: StatusHistory[] = res.data;
        return data;
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return [];
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

    const [data, setData] = React.useState<StatusHistory[]>([]);

    React.useEffect(() => {
        // Poll every 3 seconds
        const interval = setInterval(() => {
            getData().then(setData);
        }, 3000);

        // Fetch immediately on mount
        getData().then(setData);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
                <p className="text-muted-foreground text-balance">
                    Reports for applicants and onboardings
                </p>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden gap-4 pb-8">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium md:text-md">
                                Active Applicants <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
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
                                Hired Employee <UserXIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Total Hired</CardDescription>
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
                                OnHold <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Number of total OnHold applicants</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalApplicants}</div>
                            <p className="text-xs text-muted-foreground">+22% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Rejected <PercentIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Total Rejected Applicants</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">-4% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Ongoing Interview <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Number of  Ongoing Interview </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">+22% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="gap-3">
                        <CardHeader className="gap-0">
                            <CardTitle className="w-full flex justify-between items-center font-medium">
                                Total Applicants <PercentIcon className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm">Total Applicants</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">18</div>
                            <p className="text-xs text-muted-foreground">-4% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <ApplicationFunnel />

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Upcoming Interviews/Exam</CardTitle>
                            <CardDescription>Recent upcoming interview and exam dates</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-y-auto max-h-[45vh]">
                            <div className="space-y-8">
                                {applicants.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No upcoming interviews or exams found.</p>
                                ) : (
                                    applicants.map((applicant) => (
                                        <div key={applicant.applicant_id} className="flex items-center">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarFallback>{applicant.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{applicant.full_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(applicant.interview_date).toLocaleString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </p>
                                            </div>
                                            <div
                                                className={`ml-auto font-medium ${applicant.status === "examination" ? "text-blue-500" : "text-purple-500"
                                                    }`}
                                            >
                                                {applicant.status
                                                    .split(" ")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <EmploymentBreakdown />
                </div>
                <Card className="">
                    <CardHeader>
                        <CardTitle>Recent Status Updates</CardTitle>
                        <CardDescription>Applicants status changes over time</CardDescription>
                    </CardHeader>
                    <CardContent className="">
                        <RecentStatusTable data={data} columns={columns} />
                    </CardContent>
                </Card>
            </div>
        </main >
    );
}