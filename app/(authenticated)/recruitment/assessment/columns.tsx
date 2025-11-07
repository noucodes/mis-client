"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/recruitment-management/assessment/data-table-row-actions";

export type Applicant = {
    applicant_id: string;
    examination_code: string;
    first_name: string;
    last_name: string;
    position_applied: string;
    total_score?: number;
    typing_wpm?: number;
    typing_accuracy?: number;
};

/* -------------------------------------------------------------------------- */
/*                                 COLUMNS                                    */
/* -------------------------------------------------------------------------- */
export const columns: ColumnDef<Applicant>[] = [
    {
        accessorKey: "first_name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const firstName = row.original.first_name;
            const lastName = row.original.last_name;
            return <Badge variant="secondary">{lastName}, {firstName}</Badge>;
        },
    },
    {
        accessorKey: "last_name",
        header: () => null,
        cell: () => null,
    },
    {
        accessorKey: "position_applied",
        header: "Position Applied",
    },
    {
        accessorKey: "examination_code",
        header: "Examination Id",
        cell: ({ row }) => {
            const examinationCode = row.getValue("examination_code") as string;
            return <Badge variant="outline">{examinationCode}</Badge>;
        },
    },
    {
        accessorKey: "total_score",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 font-medium hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Total Score
                <ArrowUpDown className="h-4 w-4" />
            </button>
        ),
        cell: ({ row }) => {
            const score = row.original.total_score;
            if (score === undefined || score === null) {
                return <span className="text-muted-foreground text-xs">—</span>;
            }
            return (
                <div className="font-semibold text-lg">
                    {score} <span className="text-xs text-muted-foreground">/ 40</span>
                </div>
            );
        },
    },
    // ---- NEW: Typing Speed ----
    {
        accessorKey: "typing_wpm",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 font-medium hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Typing Speed
                <ArrowUpDown className="h-4 w-4" />
            </button>
        ),
        cell: ({ row }) => {
            const wpm = row.original.typing_wpm;
            return wpm != null ? (
                <span className="font-medium">{wpm} wpm</span>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },

    // ---- NEW: Typing Accuracy ----
    {
        accessorKey: "typing_accuracy",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 font-medium hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Accuracy
                <ArrowUpDown className="h-4 w-4" />
            </button>
        ),
        cell: ({ row }) => {
            const acc = row.original.typing_accuracy;
            return acc != null ? (
                <span className="font-medium">{acc}%</span>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },

    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <DataTableRowActions<Applicant> row={row} />,
    },
];