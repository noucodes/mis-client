"use client";

import React from "react";
import { Kanban } from "@/components/recruitment-management/applicants/dashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Applicant, columns } from "./column";
import { DataTable } from "@/components/recruitment-management/applicants/application-data-table";

async function getData(): Promise<Applicant[]> {
    try {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/applicants/`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch applicants");
        }

        const data: Applicant[] = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return [];
    }
}

export default function Page() {
    const [data, setData] = React.useState<Applicant[]>([]);

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
                    <span>Applicants Masterlist</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Masterlist</h1>
                <p className="text-muted-foreground text-balance">
                    List of all data in recruitment management
                </p>
            </div>

            <main className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={data} />
            </main>
        </main>
    );
}
