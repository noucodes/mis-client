"use client";

import React from "react";
import { StatusHistory, columns } from "./columns";
import { DataTable } from "@/components/recruitment-management/applicants/status-data-table";
import axios from "axios";

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
    const [data, setData] = React.useState<StatusHistory[]>([]);

    React.useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            const result = await getData();
            if (isMounted) setData(result);
        };

        // Fetch immediately on mount
        fetchData();

        // Poll every 3 seconds
        const interval = setInterval(fetchData, 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applicants</span>
                    <span>/</span>
                    <span>Status</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Status</h1>
                <p className="text-muted-foreground text-balance">
                    History of Status Changes
                </p>
            </div>

            <main className="flex-1 overflow-hidden">
                <DataTable columns={columns} data={data} />
            </main>
        </main>
    );
}
