// components/AddApplicantDialog.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface AddApplicantDialogProps {
    onSuccess?: () => void
}

/* --------------------------------------------------------------- */
/*  Helper – upload file via API route                            */
/* --------------------------------------------------------------- */
async function uploadCV(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
    }

    const data = await response.json()
    return data.url
}

/* --------------------------------------------------------------- */
/*  Main component                                                */
/* --------------------------------------------------------------- */
export function AddApplicantDialog({ onSuccess }: AddApplicantDialogProps) {
    const [loading, setLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        position_applied: "",
        employment_type: "",
        referrer: "",
        job_source: "",
    })

    const [cvFile, setCvFile] = React.useState<File | null>(null)
    const [cvFileName, setCvFileName] = React.useState<string>("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange =
        (field: keyof typeof formData) => (value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }))
        }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5 MB")
            return
        }

        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        if (!allowed.includes(file.type)) {
            toast.error("Only PDF, DOC or DOCX files are allowed")
            return
        }

        setCvFile(file)
        setCvFileName(file.name)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cvFile) {
            toast.error("Please upload a CV")
            return
        }

        setLoading(true)

        try {
            // Upload CV to S3 via API route
            const cvUrl = await uploadCV(cvFile)

            // Create applicant with CV URL - CHANGED TO JSON
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                position_applied: formData.position_applied,
                employment_type: formData.employment_type,
                referrer: formData.referrer,
                job_source: formData.job_source,
                resume_url: cvUrl,
            }

            const token =
                typeof window !== "undefined" ? localStorage.getItem("token") : ""

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/applicants`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            )

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message ?? "Failed to create applicant")
            }

            const newApplicant = await res.json()
            console.log('API Response:', newApplicant)

            // Use the form data if the response doesn't include the applicant details
            const firstName = newApplicant?.first_name || formData.first_name
            const lastName = newApplicant?.last_name || formData.last_name

            toast.success(
                `Applicant "${firstName} ${lastName}" added successfully!`
            )

            // Reset
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                position_applied: "",
                employment_type: "",
                referrer: "",
                job_source: "",
            })
            setCvFile(null)
            setCvFileName("")
            if (fileInputRef.current) fileInputRef.current.value = ""

            onSuccess?.()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message ?? "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Applicant</Button>
            </DialogTrigger>

            {/* ---------------------------------------------------- DIALOG ---------------------------------------------------- */}
            <DialogContent
                className="sm:max-w-[500px] max-h-[90vh] overflow-y-scroll flex flex-col"
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col h-full gap-4"
                >

                    {/* ------------------- HEADER ------------------- */}
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle>Add Applicant</DialogTitle>
                        <DialogDescription>
                            Fill in the details and upload CV for the new applicant.
                        </DialogDescription>
                    </DialogHeader>

                    {/* ------------------- SCROLLABLE BODY ------------------- */}
                    <div className="grid gap-4">
                        {/* First & Last Name */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-3">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="John"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        {/* Position & Employment Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-3">
                                <Label>Position Applied</Label>
                                <Select
                                    value={formData.position_applied}
                                    onValueChange={handleSelectChange("position_applied")}
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Positions</SelectLabel>
                                            <SelectItem value="Junior Developer">Junior Developer</SelectItem>
                                            <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                                            <SelectItem value="Team Lead">Team Lead</SelectItem>
                                            <SelectItem value="Project Manager">Project Manager</SelectItem>
                                            <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label>Employment Type</Label>
                                <Select
                                    value={formData.employment_type}
                                    onValueChange={handleSelectChange("employment_type")}
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Type</SelectLabel>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="Onsite">Onsite</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Job Source & CV */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-3">
                                <Label>Job Source</Label>
                                <Select
                                    value={formData.job_source}
                                    onValueChange={handleSelectChange("job_source")}
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="How did they find us?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Job Source</SelectLabel>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Indeed">Indeed</SelectItem>
                                            <SelectItem value="Company Website">Company Website</SelectItem>
                                            <SelectItem value="Referral">Referral</SelectItem>
                                            <SelectItem value="Job Fair">Job Fair</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="cv">CV / Resume</Label>
                                <Input
                                    id="cv"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    required
                                    className="flex items-center cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                            </div>
                        </div>

                        {/* Referrer – last field*/}
                        <div className="grid gap-3">
                            <Label htmlFor="referrer">Referrer (Optional)</Label>
                            <Input
                                id="referrer"
                                name="referrer"
                                value={formData.referrer}
                                onChange={handleInputChange}
                                placeholder="Name of referrer"
                            />
                        </div>
                    </div>

                    {/* ------------------- FOOTER ------------------- */}
                    <DialogFooter className="bg-background">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Add Applicant"}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}