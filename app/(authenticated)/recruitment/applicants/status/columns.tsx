"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type StatusHistory = {
    status_id: string;
    name: string;
    applicant_id: string;
    status_type: string;
    status_value: string;
    comment: string;
    updated_by: string;
    updated_by_role: string;
    status_created: string;
};

// Utility: Color-coded badges for status_value
const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "hired":
        case "onboarding":
            return "bg-green-100 text-green-800 border-green-300";
        case "rejected":
        case "failed":
            return "bg-red-100 text-red-800 border-red-300";
        case "interview":
        case "initial interview":
            return "bg-blue-100 text-blue-800 border-blue-300";
        case "exam":
        case "assessment":
            return "bg-yellow-100 text-yellow-800 border-yellow-300";
        default:
            return "bg-muted text-muted-foreground border-muted";
    }
};

export const columns: ColumnDef<StatusHistory>[] = [
    {
        accessorKey: "name",
        header: "Applicant Name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return (
                <span className="font-medium">
                    {name}
                </span>
            );
        }
    },
    {
        accessorKey: "status_value",
        header: "Status Value",
        cell: ({ row }) => {
            const statusValue = row.getValue("status_value") as string;
            return (
                <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs font-medium bg-muted/40"
                >
                    {statusValue}
                </Badge>
            );
        },
    },
    {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => {
            const comment = row.getValue("comment") as string;
            return (
                <Card className="px-3 py-2 bg-muted/20 border rounded-xl shadow-sm w-fit">
                    <p className="text-sm text-muted-foreground italic">
                        {comment || "No comment"}
                    </p>
                </Card>
            );
        },
    },
    {
        id: "updated_info",
        header: "Updated By",
        cell: ({ row }) => {
            const updatedBy = row.original.updated_by;
            const updatedRole = row.original.updated_by_role;

            return (
                <div className="flex flex-col leading-tight">
                    <span className="font-medium text-sm text-foreground">
                        {updatedBy}
                    </span>
                    <Badge
                        variant="outline"
                        className="mt-1 text-xs px-2 py-0 bg-muted text-muted-foreground"
                    >
                        {updatedRole}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "status_created",
        header: "Status Created",
        cell: ({ row }) => {
            const createdDate = row.original.status_created;
            if (!createdDate) return "N/A";
            try {
                const date = new Date(createdDate);
                if (isNaN(date.getTime())) return "Invalid Date";
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                });
            } catch (error) {
                return "Invalid Date";
            }
        },
    }
];
