'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { roleLabels } from "@/lib/roleLabels";

type ActionStatus =
    | "Shortlisted"
    | "Blocklisted"
    | "Not Qualified"
    | "Rejected"
    | "Applicant"; // only used internally for restore

interface StatusActionButtonProps {
    id: string;
    /** The status you *want* to set (or restore from) */
    targetStatus: Exclude<ActionStatus, "Applicant">;
    onSuccess?: () => void;
    /** Which DB field to update – default = employment_status */
    fieldName?: "employment_status" | "application_status";
    /** Show comment field when applying the status (default = true) */
    requireComment?: boolean;
}

/**
 * Generic button that:
 *   • Applies the target status (with optional comment)
 *   • Restores to “Applicant” when the applicant already has that status
 *   • Hides everything else when the applicant is in the target state
 */
export function StatusActionButton({
    id,
    targetStatus,
    onSuccess,
    fieldName = "employment_status",
    requireComment = true,
}: StatusActionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>("");
    const [comment, setComment] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    /* --------------------------------------------------------------- */
    /* 1. Load current status (so we know if we are applying or restoring) */
    /* --------------------------------------------------------------- */
    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/applicants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentStatus(res.data[fieldName] ?? "");
            } catch (err) {
                console.error("Failed to fetch applicant status", err);
            }
        };
        if (id) fetchCurrent();
    }, [id, token, fieldName]);

    /* --------------------------------------------------------------- */
    /* 2. Decide what we are doing */
    /* --------------------------------------------------------------- */
    const isAlreadyInState = currentStatus === targetStatus;
    const isApplying = !isAlreadyInState;
    const finalStatus = isApplying ? targetStatus : "Applicant";

    const actionVerb = isApplying
        ? targetStatus === "Rejected"
            ? "Reject"
            : targetStatus
        : "Restore";

    /* --------------------------------------------------------------- */
    /* 3. Submit */
    /* --------------------------------------------------------------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // enforce comment when applying (skip for restore)
        if (requireComment && isApplying && !comment.trim()) return;

        setIsLoading(true);
        try {
            const personalRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload: any = {
                [fieldName]: finalStatus,
                updated_by: personalRes.data.name,
                updated_by_role: roleLabels[personalRes.data.role] || "Unknown",
            };

            if (isApplying) {
                payload.comment = comment.trim() || `${actionVerb} – no comment`;
            } else {
                payload.comment = `Restored from ${targetStatus}`;
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

            setCurrentStatus(finalStatus);
            onSuccess?.();
        } catch (err) {
            console.error(`Error ${actionVerb} applicant`, err);
        } finally {
            setIsLoading(false);
        }
    };

    /* --------------------------------------------------------------- */
    /* 4. UI – only show the relevant button */
    /* --------------------------------------------------------------- */
    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Comment – only when applying the status */}
            {requireComment && isApplying && (
                <div className="grid gap-3">
                    <Label htmlFor="comment">
                        {`Reason for ${actionVerb.toLowerCase()}`}
                    </Label>
                    <Textarea
                        id="comment"
                        placeholder={`Why ${actionVerb.toLowerCase()} this applicant?`}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            )}

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button">
                        Cancel
                    </Button>
                </DialogClose>

                <Button type="submit" disabled={isLoading}>
                    {isLoading
                        ? `${actionVerb}ing…`
                        : isApplying
                            ? actionVerb
                            : `Restore to Applicant`}
                </Button>
            </DialogFooter>
        </form>
    );
}