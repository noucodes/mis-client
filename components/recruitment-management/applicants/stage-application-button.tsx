"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import axios from "axios";
import { roleLabels } from "@/lib/roleLabels";
import { format } from "date-fns";

const stages = [
    "Applicant",
    "Initial Interview",
    "Examination",
    "Final Interview",
    "Job Offer",
    "Contract Signing",
    "Hired",
];

export function StageApplicantButton({
    id,
    onStage,
    applicationStatus,
    direction = "next",
}: {
    id: string;
    onStage?: () => void;
    applicationStatus: string;
    direction?: "next" | "previous";
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // ✅ Precompute next/previous stage and whether a calendar is needed
    const { newStage, requiresDate } = useMemo(() => {
        const currentIndex = stages.indexOf(applicationStatus);
        const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
        const nextStage = stages[newIndex];
        return {
            newStage: nextStage,
            requiresDate: ["Examination", "Final Interview"].includes(nextStage),
        };
    }, [applicationStatus, direction]);

    const handleStageChange = async ({ comment }: { comment: string }) => {
        try {
            setIsLoading(true);

            if (!newStage) {
                console.warn("No further stage available");
                return;
            }

            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : "";

            const personalRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload: any = {
                application_status: applicationStatus,
                new_status: newStage,
                comment,
                updated_by: personalRes.data.name,
                updated_by_role: roleLabels[personalRes.data.role] || "Unknown",
            };

            if (newStage === "Examination" && selectedDate) {
                payload.examination_date = selectedDate;
            } else if (newStage === "Final Interview" && selectedDate) {
                payload.final_interview_date = selectedDate;
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants/${id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(`Applicant moved to: ${newStage}`);
            if (onStage) onStage();
        } catch (error) {
            console.error("Error updating applicant stage:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleStageChange({
                    comment: formData.get("comment") as string,
                });
            }}
            className="grid gap-4"
        >
            <div className="grid gap-3">
                <Label htmlFor="comment">Comment</Label>
                <Textarea id="comment" name="comment" />
            </div>

            {/* ✅ Conditionally show calendar BEFORE submission */}
            {requiresDate && (
                <div className="grid gap-3">
                    <Label>
                        {newStage === "Examination"
                            ? "Set Examination Date"
                            : "Set Final Interview Date"}
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
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? "Saving..."
                        : direction === "next"
                            ? "Move Forward"
                            : "Move Back"}
                </Button>
            </DialogFooter>
        </form>
    );
}
