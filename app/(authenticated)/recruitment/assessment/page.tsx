"use client";

import React, { useState, useEffect } from "react";
import { Applicant, columns } from "./columns";
import { DataTable } from "@/components/recruitment-management/applicants/application-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Extend Applicant to include total_score
interface ApplicantWithScore extends Applicant {
    total_score?: number;
    typing_wpm?: number;
    typing_accuracy?: number;
}

export default function Page() {
    const [data, setData] = useState<ApplicantWithScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setRefreshing(true);
            setError(null);

            const token = localStorage.getItem("token") || "";
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

            // 1. applicants
            const applicantsRes = await fetch(`${baseUrl}/applicants/status/Applicant`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!applicantsRes.ok) throw new Error("Failed to fetch applicants");
            const applicants: Applicant[] = await applicantsRes.json();

            // 2. fetch exam result (with typing) for each
            const applicantsWithScores: ApplicantWithScore[] = await Promise.all(
                applicants.map(async (applicant) => {
                    if (!applicant.examination_code) {
                        return { ...applicant, total_score: undefined };
                    }

                    try {
                        const examRes = await fetch(
                            `${baseUrl}/examination/exam/${applicant.examination_code}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (examRes.ok) {
                            const d = await examRes.json();
                            return {
                                ...applicant,
                                total_score: d.total_score,
                                typing_wpm: d.typing_wpm,
                                typing_accuracy: d.typing_accuracy,
                            };
                        }
                    } catch (e) {
                        console.warn(`Score missing for ${applicant.examination_code}`);
                    }
                    return { ...applicant, total_score: undefined };
                })
            );

            setData(applicantsWithScores);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            if (!isBackground) setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(() => fetchData(true), 10_000);
        return () => clearInterval(id);
    }, []);

    // -----------------------------------------------------------------
    //  First load + background polling
    // -----------------------------------------------------------------
    useEffect(() => {
        fetchData();                     // initial load
        const id = setInterval(() => fetchData(true), 10_000);
        return () => clearInterval(id);
    }, []);

    // -----------------------------------------------------------------
    //  UI
    // -----------------------------------------------------------------
    return (
        <main className="space-y-8 overflow-x-hidden p-6">
            {/* header … */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applicants</span>
                    <span>/</span>
                    <span>Assessment</span>
                </div>
                <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
                <p className="text-muted-foreground">Assessment list with total scores</p>
            </div>

            <div className="relative flex-1 overflow-hidden">
                {/* ----- first‑load skeleton ----- */}
                {loading && (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                )}

                {/* ----- error ----- */}
                {error && !loading && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* ----- table (always stays mounted) ----- */}
                {!loading && data.length > 0 && (
                    <div className="relative">
                        <DataTable columns={columns} data={data} />
                        {/* tiny refresh spinner in the corner */}
                        {refreshing && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <svg
                                    className="h-3 w-3 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.25" />
                                    <path d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Refreshing…
                            </div>
                        )}
                    </div>
                )}

                {/* ----- empty state ----- */}
                {!loading && data.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No applicants found.
                    </div>
                )}
            </div>
        </main>
    );
}