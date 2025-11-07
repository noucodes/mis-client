"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTableRowActions } from "@/components/recruitment-management/applicants/data-table-row-actions";
import { roleLabels } from "@/lib/roleLabels";

/* -------------------------------------------------------------------------- */
/*                                 TYPES & DATA                               */
/* -------------------------------------------------------------------------- */
export type Applicant = {
    applicant_id: string;
    examination_code: string;
    first_name: string;
    last_name: string;
    position_applied: string;
    employment_status: "Applicant" | "On Hold" | "Rejected" | "Hired";
    application_status:
    | "Initial Interview"
    | "Examination"
    | "Final Interview"
    | "Job Offer"
    | "Hired"
    | "Reject";
    status_comment?: string;
    status_history?: Array<{
        status: string;
        date: string;
        updated_by: string;
        updated_by_role: string;
        comment: string;
    }>;
    extra_tags?: string[]; // <-- NEW: for tags
};

const statusOptions: Applicant["application_status"][] = [
    "Initial Interview",
    "Examination",
    "Final Interview",
    "Job Offer",
    "Hired",
    "Reject",
];

/* -------------------------------------------------------------------------- */
/*                               TAGS DEFINITION                              */
/* -------------------------------------------------------------------------- */
const AVAILABLE_TAGS = [
    "No Show Final Interview",
    "Declined the Job Offer",
    "Withdrawn Application",
    "Failed Final Interview",
    "Twice Rebooked",
    "No Show Second Interview",
    "Reapplication",
    "Failed Initial Interview",
    "Failed Exam",
    "Failed 2nd Interview",
    "Keep CV",
    "FOLLOW UP",
    "DEPLOYED",
    "FOR UPDATES",
] as const;

/* -------------------------------------------------------------------------- */
/*                               HELPER: COLORS                               */
/* -------------------------------------------------------------------------- */
const getStatusColor = (status: string) => {
    switch (status) {
        case "Initial Interview": return "bg-gray-500 hover:bg-gray-600";
        case "Examination": return "bg-orange-500 hover:bg-orange-600";
        case "Final Interview": return "bg-yellow-500 hover:bg-yellow-600";
        case "Job Offer": return "bg-green-500 hover:bg-green-600";
        case "Hired": return "bg-blue-500 hover:bg-blue-600";
        case "Reject": return "bg-red-500 hover:bg-red-600";
        default: return "bg-muted";
    }
};

const getTagColor = (tag: string) => {
    if (tag.includes("No Show") || tag.includes("Failed") || tag.includes("Declined") || tag.includes("Withdrawn"))
        return "bg-red-100 text-red-800 border-red-300";
    if (tag.includes("FOLLOW UP") || tag.includes("FOR UPDATES") || tag.includes("Reapplication"))
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (tag.includes("DEPLOYED") || tag.includes("Hired"))
        return "bg-green-100 text-green-800 border-green-300";
    if (tag.includes("Keep CV"))
        return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
};

/* -------------------------------------------------------------------------- */
/*                         STATUS CHANGE MODAL (unchanged)                    */
/* -------------------------------------------------------------------------- */
const StatusChangeModal = ({
    applicant,
    newStatus,
    isOpen,
    onOpenChange,
    onSuccess,
}: {
    applicant: Applicant;
    newStatus: Applicant["application_status"];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const requiresDate = ["Examination", "Final Interview"].includes(newStatus);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const comment = formData.get("comment") as string;

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

            const personalRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload: any = {
                application_status: applicant.application_status,
                new_status: newStatus,
                comment,
                updated_by: personalRes.data.name,
                updated_by_role: roleLabels[personalRes.data.role] || "Unknown",
            };

            if (newStatus === "Examination" && selectedDate) {
                payload.examination_date = selectedDate;
            } else if (newStatus === "Final Interview" && selectedDate) {
                payload.final_interview_date = selectedDate;
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants/${applicant.applicant_id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating applicant status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Status to {newStatus}</DialogTitle>
                    <DialogDescription>
                        {applicant.first_name} {applicant.last_name} - {applicant.position_applied}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            name="comment"
                            placeholder="Add a comment about this status change..."
                        />
                    </div>

                    {requiresDate && (
                        <div className="grid gap-3">
                            <Label>
                                {newStatus === "Examination" ? "Set Examination Date" : "Set Final Interview Date"}
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"
                                            }`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

/* -------------------------------------------------------------------------- */
/*                    STATUS DETAILS MODAL WITH TAG EDITOR                    */
/* -------------------------------------------------------------------------- */
const StatusDetailsModal = ({ applicant }: { applicant: Applicant }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(
        new Set(applicant.extra_tags || [])
    );
    const [isSaving, setIsSaving] = useState(false);

    const toggleTag = (tag: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) newSet.delete(tag);
        else newSet.add(tag);
        setSelectedTags(newSet);
    };

    const handleSaveTags = async () => {
        setIsSaving(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants/${applicant.applicant_id}`,
                {
                    extra_tags: Array.from(selectedTags),
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsOpen(false);
        } catch (error) {
            console.error("Failed to save tags:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(true)}
            >
                <Eye className="h-4 w-4" />
            </Button>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Application Status Details</DialogTitle>
                    <DialogDescription>
                        {applicant.first_name} {applicant.last_name} - {applicant.position_applied}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Status */}
                    <div>
                        <h4 className="font-semibold mb-2">Current Status</h4>
                        <Badge className={getStatusColor(applicant.application_status)}>
                            {applicant.application_status}
                        </Badge>
                    </div>

                    {/* Tags Editor */}
                    <div>
                        <h4 className="font-semibold mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map((tag) => {
                                const isSelected = selectedTags.has(tag);
                                return (
                                    <Badge
                                        key={tag}
                                        variant={isSelected ? "default" : "outline"}
                                        className={`cursor-pointer transition-all text-xs ${isSelected ? getTagColor(tag) : "border-gray-300"
                                            }`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Latest Comment */}
                    {applicant.status_comment && (
                        <div>
                            <h4 className="font-semibold mb-2">Latest Comment</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                {applicant.status_comment}
                            </p>
                        </div>
                    )}

                    {/* Status History */}
                    {applicant.status_history && applicant.status_history.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Status History</h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {applicant.status_history.map((history, index) => (
                                    <div key={index} className="border-l-2 border-primary pl-4 pb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{history.status}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {history.date}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Updated by: {history.updated_by} ({history.updated_by_role})
                                        </p>
                                        {history.comment && (
                                            <p className="text-sm bg-muted p-2 rounded">{history.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveTags} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Tags"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

/* -------------------------------------------------------------------------- */
/*                         APPLICATION STATUS CELL (unchanged)                */
/* -------------------------------------------------------------------------- */
const ApplicationStatusCell = ({
    row,
    onUpdate,
}: {
    row: any;
    onUpdate?: () => void;
}) => {
    const applicant = row.original as Applicant;
    const status = applicant.application_status;
    const [selectedStatus, setSelectedStatus] = useState<Applicant["application_status"] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleValueChange = (value: Applicant["application_status"]) => {
        if (value !== status) {
            setSelectedStatus(value);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) setSelectedStatus(null);
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={status} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] h-8">
                    <SelectValue>{status}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <StatusDetailsModal applicant={applicant} />

            {selectedStatus && (
                <StatusChangeModal
                    applicant={applicant}
                    newStatus={selectedStatus}
                    isOpen={isModalOpen}
                    onOpenChange={handleModalClose}
                    onSuccess={onUpdate}
                />
            )}
        </div>
    );
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
        header: "Position Given",
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
        accessorKey: "employment_status",
        header: "Employment Status",
        cell: ({ row }) => {
            const status = row.getValue("employment_status") as Applicant["employment_status"];
            return <Badge variant="secondary">{status}</Badge>;
        },
    },
    {
        accessorKey: "application_status",
        header: "Application Status",
        cell: ({ row }) => (
            <ApplicationStatusCell
                row={row}
                onUpdate={() => {
                    console.log("Status updated, refreshing table...");
                }}
            />
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <DataTableRowActions<Applicant> row={row} />,
    },
];