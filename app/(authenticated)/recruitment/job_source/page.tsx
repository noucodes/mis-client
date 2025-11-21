"use client";

import React from "react";
import { DataTable } from "@/components/recruitment-management/applicants/application-data-table";


export default function Page() {

    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applicants</span>
                    <span>/</span>
                    <span>Job Source</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Job Source</h1>
                <p className="text-muted-foreground text-balance">
                    Job Source List
                </p>
            </div>

            <main className="flex-1 overflow-hidden">

            </main>
        </main>
    );
}
