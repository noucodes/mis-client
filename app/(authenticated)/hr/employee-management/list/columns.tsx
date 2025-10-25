"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type Employee = {
    employeeid: string
    name: string
    position: string
    status: "active" | "pending" | "resigned"
    teamleader: string
}

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "employeeid",
        header: "Employee Id",
    },
    {
        accessorKey: "name",
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
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => {
            const position = row.getValue("position") as string
            return <Badge>{position}</Badge>
        }
    },
    {
        accessorKey: "teamleader",
        header: "Team Leader",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as Employee["status"]
            return (
                <Badge
                    variant={
                        status === "active"
                            ? "default"
                            : status === "resigned"
                                ? "destructive"
                                : "secondary"
                    } className={status === "active"
                        ? "bg-green-500"
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
        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                        >
                            View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Contribution</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },

]
