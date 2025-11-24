"use client";

import * as React from "react";
import Dashboard from "@/components/recruitment-management/onboarding/dashboard";


export default function Page() {
    return (
        <main className="space-y-8 overflow-x-hidden">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>Onboarding</span>
                    <span>/</span>
                    <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Onboarding Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Pipeline for the Onboarding Process
                </p>
            </div>

            <main className="flex-1 overflow-hidden">
                <div className="text-center text-muted-foreground">
                    <Dashboard />
                </div>
            </main>
        </main>
    );
}
