"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "@/components/recruitment-management/applicants/data-table-row-actions"

export type Applicant = {
    applicant_id: string
    examination_code: string
    full_name: string
    position_applied: string
    employment_status: "Applicant" | "On Hold" | "Rejected" | "Hired"
    application_status: "Initial Interview" | "Examination" | "Final Interview" | "Job Offer" | "Contract Signing" | "Reject"
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
        accessorKey: "examination_code",
        header: "Examination Id",
        cell: ({ row }) => {
            const examinationCode = row.getValue("examination_code") as string
            return <Badge>{examinationCode}</Badge>
        }
    },
    {
        accessorKey: "position_applied",
        header: "Position Given",

    },
    {
        accessorKey: "employment_status",
        header: "Employment Status",
        cell: ({ row }) => {
            const status = row.getValue("employment_status") as Applicant["employment_status"]
            return (
                <Badge>
                    {status}
                </Badge>
            )
        },
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
                                : status === "Contract Signing"
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
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <DataTableRowActions<Applicant> row={row} />,
    },

]
