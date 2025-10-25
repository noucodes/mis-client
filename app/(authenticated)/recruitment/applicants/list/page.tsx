"use client";

import React from "react";
import { Applicant, columns } from "./columns";
import { DataTable } from "@/components/recruitment-management/applicants/application-data-table";

async function getApplicants(): Promise<Applicant[]> {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const employmentStatus = "Applicant";
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/applicants/status/${employmentStatus}`,
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
            getApplicants().then(setData);
        }, 3000);

        // Fetch immediately on mount
        getApplicants().then(setData);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applicants</span>
                    <span>/</span>
                    <span>List of Applicants</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">List of Applicants</h1>
                <p className="text-muted-foreground text-balance">
                    Applicants List
                </p>
            </div>

            <main className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={data} />
            </main>
        </main>
    );
}
