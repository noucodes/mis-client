"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { columns, type Applicant } from "@/components/recruitment-management/onboarding/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

async function getData(): Promise<Applicant[]> {
    try {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : "";

        // 1️⃣ Fetch all applicants
        const { data: applicants } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/onboarding`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        // 2️⃣ Fetch master task list once (onboarding_tasks)
        const { data: masterTasks } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/onboarding/tasks`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const totalTasks = masterTasks?.tasks?.length || 0;
        console.log("Total Tasks:", totalTasks);

        // 3️⃣ For each applicant, fetch their progress
        const applicantsWithProgress = await Promise.all(
            applicants.map(async (applicant: any) => {
                try {
                    const { data: applicantTasks } = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/${applicant.applicant_id}/tasks`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    const tasksArray = Array.isArray(applicantTasks)
                        ? applicantTasks
                        : applicantTasks?.tasks || [];

                    // Filter completed
                    const completedTasks = tasksArray.filter(
                        (t: any) => t.is_completed
                    ).length;

                    const progress =
                        totalTasks > 0
                            ? Math.round((completedTasks / totalTasks) * 100)
                            : 0;

                    return {
                        id: applicant.applicant_id,
                        name: applicant.full_name,
                        email: applicant.email,
                        progress,
                        completedTasks,
                        totalTasks,
                    };
                } catch (err) {
                    console.error(
                        `Error fetching tasks for applicant ${applicant.applicant_id}:`,
                        err
                    );
                    return {
                        id: applicant.applicant_id,
                        name: applicant.full_name,
                        email: applicant.email,
                        progress: 0,
                        completedTasks: 0,
                        totalTasks,
                    };
                }
            })
        );

        return applicantsWithProgress;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export default function Page() {
    const [data, setData] = React.useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const newData = await getData();
            setData(newData);
            setIsLoading(false);
        };

        // Load once
        load();

        // Poll every 3 seconds
        const interval = setInterval(load, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="space-y-8 overflow-x-hidden px-8 py-2">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Onboarding</span>
                    <span>/</span>
                    <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">
                    Onboarding Dashboard
                </h1>
                <p className="text-muted-foreground text-balance">
                    Pipeline for the Onboarding Process
                </p>
            </div>

            <main className="flex-1 overflow-hidden">
                <Tabs defaultValue="report" className="w-full flex justify-center">
                    <TabsList className="grid w-full md:w-3/5 lg:w-4/5 grid-cols-2">
                        <TabsTrigger value="report">Reports</TabsTrigger>
                        <TabsTrigger value="list">List of Applicants</TabsTrigger>
                    </TabsList>

                    {/* Applicants */}
                    <TabsContent value="list" className="mt-6 space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading applicants...
                            </div>
                        ) : (
                            <DataTable columns={columns} data={data} />
                        )}
                    </TabsContent>

                    {/* Reports */}
                    <TabsContent value="report" className="mt-6">
                        <div className="text-center py-12 text-muted-foreground">
                            Reports coming soon...
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </main>
    );
}
