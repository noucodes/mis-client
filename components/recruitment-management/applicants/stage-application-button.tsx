import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { roleLabels } from "@/lib/roleLabels";

const stages = [
    "Applicant",
    "Initial Interview",
    "Examination",
    "Final Interview",
    "Job Offer",
    "Contract Signing",
    "Hired"
];

export function StageApplicantButton({
    id,
    onStage,
    applicationStatus,
    direction = "next", // default: move forward
}: {
    id: string;
    onStage?: () => void;
    applicationStatus: string;
    direction?: "next" | "previous";
}) {
    const [isLoading, setIsLoading] = useState(false);

    // Move to next or previous stage
    const handleStageChange = async ({ comment }: { comment: string }) => {
        try {
            setIsLoading(true);

            const currentIndex = stages.indexOf(applicationStatus);
            if (currentIndex === -1) {
                console.warn("Invalid application status");
                return;
            }

            let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

            // Prevent out of bounds
            if (newIndex < 0 || newIndex >= stages.length) {
                console.warn("No further stage available");
                return;
            }

            const newStage = stages[newIndex];

            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : "";

            const personalRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: {
                    Authorization: `bearer ${token}`,
                },
            });

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants/${id}`,
                {
                    application_status: applicationStatus,
                    new_status: newStage,
                    comment,
                    updated_by: personalRes.data.name,
                    updated_by_role: roleLabels[personalRes.data.role] || "Unknown",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // No need for res.ok, axios throws on error
            console.log(`Applicant moved to: ${newStage}`);

            if (onStage) onStage(); // ✅ notify parent
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
