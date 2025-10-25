"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { ChecklistModal } from "@/components/recruitment-management/onboarding/checklist-modal"
import * as React from "react"

export type Applicant = {
    id: number
    name: string
    email: string
    progress: number
    completedTasks: number
    totalTasks: number
}

export const columns: ColumnDef<Applicant>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const name = row?.getValue("name") as string
            return <div className="font-medium">{name || "N/A"}</div>
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row?.getValue("email") as string
            return <div className="text-muted-foreground">{email || "N/A"}</div>
        },
    },
    {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
            if (!row) return null

            const progress = (row.getValue("progress") as number) || 0
            const completedTasks = row.original?.completedTasks || 0
            const totalTasks = row.original?.totalTasks || 0

            return (
                <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {completedTasks}/{totalTasks} tasks
                        </span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const progress = (row?.getValue("progress") as number) || 0

            if (progress === 100) {
                return <Badge className="bg-green-600">Completed</Badge>
            } else if (progress > 0) {
                return <Badge variant="secondary">In Progress</Badge>
            } else {
                return <Badge variant="outline">Not Started</Badge>
            }
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const applicant = row.original
            const [open, setOpen] = React.useState(false)

            if (!applicant) return null

            return (
                <>
                    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Checklist
                    </Button>
                    <ChecklistModal
                        open={open}
                        onOpenChange={setOpen}
                        applicantId={applicant.id}
                        applicantName={applicant.name}
                    />
                </>
            )
        },
    },
]
