import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Loader2, Download } from "lucide-react";
import { useState } from "react";

export function PersonalInfo({ personalInfo }: { personalInfo: any }) {
    const [downloadingResume, setDownloadingResume] = useState(false);

    // Handle resume download
    const handleDownloadResume = async () => {
        if (!personalInfo?.resume_url) return;

        setDownloadingResume(true);
        try {
            console.log("Downloading resume from:", personalInfo.resume_url);

            const response = await fetch("/api/download-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: personalInfo.resume_url }),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                // Try to get error message
                const contentType = response.headers.get("content-type");
                let errorMessage = "Failed to download resume";

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    errorMessage = `Server error: ${response.status}`;
                }

                throw new Error(errorMessage);
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${personalInfo.first_name}_${personalInfo.last_name}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Error downloading resume:", error);
            alert(`Failed to download resume: ${error.message}`);
        } finally {
            setDownloadingResume(false);
        }
    };

    const formatExaminationDateTime = (dateString: string): string => {
        if (!dateString) return "No Date Found";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString("en-PH", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return "Not yet hired";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Invalid Date";
        }
    };
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 flex flex-col items-left">
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Name:</Label>
                    <span className="col-span-2 text-left">{personalInfo.last_name}, {personalInfo.first_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Email:</Label>
                    <span className="col-span-2 text-left">{personalInfo.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Position Applied:</Label>
                    <span className="col-span-2 text-left">{personalInfo.position_applied}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Phone:</Label>
                    <span className="col-span-2 text-left">{personalInfo.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Referrer:</Label>
                    <span className="col-span-2 text-left">{personalInfo.referrer || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Date Hired:</Label>
                    <span className="col-span-2 text-left">{formatDateTime(personalInfo.date_hired)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Job Source:</Label>
                    <span className="col-span-2 text-left">{personalInfo.job_source}</span>
                </div>
            </div>
            <div className="space-y-3 flex flex-col items-left">
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Employment Status:</Label>
                    <span className="col-span-2 text-left">{personalInfo.employment_status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Application Status:</Label>
                    <span className="col-span-2 text-left">{personalInfo.application_status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Employment Location:</Label>
                    <span className="col-span-2 text-left">{personalInfo.employment_location}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Examination Date:</Label>
                    <span className="col-span-2 text-left">{formatExaminationDateTime(personalInfo.final_interview_date)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    <Label className="text-muted-foreground text-left">Final Interview Date:</Label>
                    <span className="col-span-2 text-left">{formatExaminationDateTime(personalInfo.final_interview_date)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Label className="text-muted-foreground text-left">Resume:</Label>
                    {personalInfo.resume_url ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="col-span-2 justify-start h-8 px-3"
                            onClick={handleDownloadResume}
                            disabled={downloadingResume}
                        >
                            {downloadingResume ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {downloadingResume ? "Downloading..." : "Download Resume"}
                        </Button>
                    ) : (
                        <span className="col-span-2 text-left text-muted-foreground">N/A</span>
                    )}
                </div>
            </div>
        </div>
    );
}
