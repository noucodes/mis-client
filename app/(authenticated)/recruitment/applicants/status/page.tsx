"use client";

import React from "react";
import { StatusHistory, columns } from "./columns";
import { DataTable } from "@/components/recruitment-management/applicants/status-data-table";
import axios from "axios";

interface ApplicantName {
    first_name: string;
    last_name: string;
}

async function getData(): Promise<StatusHistory[]> {
    try {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : "";

        // Fetch status history
        const statusRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/status/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const statusData: any[] = statusRes.data.statuses || statusRes.data;

        // Fetch all applicants
        const applicantsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/applicants/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const applicantsData: any[] = applicantsRes.data.applicants || applicantsRes.data;

        // Build typed map: applicant_id → name
        const applicantsMap = new Map<number, ApplicantName>(
            applicantsData.map((applicant) => [
                applicant.applicant_id,
                {
                    first_name: applicant.first_name ?? "Unknown",
                    last_name: applicant.last_name ?? "Unknown",
                },
            ])
        );

        // Enrich status data
        const enrichedData: StatusHistory[] = statusData.map((status) => {
            const applicant = applicantsMap.get(status.applicant_id);
            return {
                ...status,
                first_name: applicant?.first_name ?? "Unknown",
                last_name: applicant?.last_name ?? "Unknown",
            };
        });

        return enrichedData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export default function Page() {
    const [data, setData] = React.useState<StatusHistory[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            const result = await getData();
            if (isMounted) {
                setData(result);
                setIsLoading(false);
            }
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
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
            </main>
        </main>
    );
}