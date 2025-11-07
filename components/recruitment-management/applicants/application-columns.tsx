"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/recruitment-management/applicants/data-table-row-actions"

export type Applicant = {
    applicant_id: string
    examination_code: string
    full_name: string
    position_applied: string
    employment_status: "Applicant" | "On Hold" | "Rejected" | "Hired"
    application_status: "Initial Interview" | "Examination" | "Final Interview" | "Job Offer" | "Hired" | "Reject"
}

export const columns: ColumnDef<Applicant>[] = [
    {
        accessorKey: "applicant_id",
        header: "Applicant Id",
    },
    {
        accessorKey: "full_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "position_applied",
        header: "Position Given",

    },
    {
        accessorKey: "application_status",
        header: "Application Status",
        cell: ({ row }) => {
            const status = row.getValue("application_status") as Applicant["application_status"]
            return (
                <Badge className={status === "Initial Interview"
                    ? "bg-gray-500"
                    : status === "Examination"
                        ? "bg-red-500"
                        : status === "Final Interview"
                            ? "bg-yellow-500"
                            : status === "Job Offer"
                                ? "bg-green-500"
                                : status === "Hired"
                                    ? "bg-blue-500"
                                    : status === "Reject"
                                        ? "bg-red-500"
                                        : ""}
                >
                    {status}
                </Badge>
            )
        },
    },

]
