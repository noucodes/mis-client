import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { roleLabels } from "@/lib/roleLabels";

export function RejectApplicantButton({
    id,
    onReject,
}: {
    id: string;
    onReject?: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [comment, setComment] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Fetch current employment status when the modal opens or ID changes
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/applicants/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIsRejected(res.data.employment_status === "Rejected");
            } catch (error) {
                console.error("Error fetching applicant status:", error);
            }
        };

        if (id) fetchStatus();
    }, [id, token]);

    const handleRejectOrRestore = async () => {
        try {
            setIsLoading(true);

            const personalRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedStatus = isRejected ? "Applicant" : "Rejected";
            const updatedComment = isRejected ? "Restored from rejection" : comment;

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants/${id}`,
                {
                    employment_status: updatedStatus,
                    comment: updatedComment,
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

            console.log(
                `Applicant ${id} ${isRejected ? "restored to Applicant" : "rejected"}`
            );

            setIsRejected(!isRejected);
            if (onReject) onReject();
        } catch (error) {
            console.error("Error updating applicant:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleRejectOrRestore();
            }}
            className="grid gap-4"
        >
            {!isRejected && (
                <div className="grid gap-3">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                        id="comment"
                        name="comment"
                        placeholder="Reason for rejection"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? isRejected
                            ? "Restoring..."
                            : "Rejecting..."
                        : isRejected
                            ? "Restore to Applicant"
                            : "Reject"}
                </Button>
            </DialogFooter>
        </form>
    );
}
