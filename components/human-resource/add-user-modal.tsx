"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the form data type
interface FormData {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    employeeId: string
    department: string
    position: string
    role: string
}

// Define the errors type
interface FormErrors {
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    employeeId?: string
    department?: string
    position?: string
    role?: string
}

// Validation function
const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {}

    // Full Name validation
    if (!data.fullName || data.fullName.length < 2) {
        errors.fullName = "Full name must be at least 2 characters"
    } else if (data.fullName.length > 100) {
        errors.fullName = "Full name must be less than 100 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
        errors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(data.password)) {
        errors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(data.password)) {
        errors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(data.password)) {
        errors.password = "Password must contain at least one number"
    }

    // Confirm Password validation
    if (data.confirmPassword !== data.password) {
        errors.confirmPassword = "Passwords do not match"
    }

    // Employee ID validation
    if (!data.employeeId || data.employeeId.length < 3) {
        errors.employeeId = "Employee ID must be at least 3 characters"
    } else if (data.employeeId.length > 20) {
        errors.employeeId = "Employee ID must be less than 20 characters"
    }

    // Department validation
    if (!data.department) {
        errors.department = "Please select a department"
    }

    // Position validation
    if (!data.position || data.position.length < 2) {
        errors.position = "Position must be at least 2 characters"
    } else if (data.position.length > 100) {
        errors.position = "Position must be less than 100 characters"
    }

    // Role validation
    if (!data.role) {
        errors.role = "Please select a role"
    }

    return errors
}

const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
    return Math.min(strength, 100)
}

const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
}

const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return "Weak"
    if (strength < 70) return "Medium"
    return "Strong"
}

export function AddUserModal({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        employeeId: "",
        department: "",
        position: "",
        role: "",
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } },
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (name === "password") {
            setPasswordStrength(calculatePasswordStrength(value))
        }
        // Clear error for the field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const handleSelectChange = (name: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear error for the field when user selects a value
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const validationErrors = validateForm(formData)
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Please fix the errors in the form")
            return
        }

        try {
            setLoading(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    employee_id: formData.employeeId,
                    department: formData.department,
                    position: [formData.position],
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Failed to create user")
            }

            toast.success("User created successfully!", {
                description: `${formData.fullName} has been added to the system.`,
            })

            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                employeeId: "",
                department: "",
                position: "",
                role: "",
            })
            setPasswordStrength(0)
            setErrors({})
            setOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "Failed to create user. Please try again."
            toast.error("Error creating user", {
                description: errorMessage,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                employeeId: "",
                department: "",
                position: "",
                role: "",
            })
            setPasswordStrength(0)
            setErrors({})
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-white">Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Add a new user to the system. All fields are required.</DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
                            <div className="space-y-4 rounded-lg border p-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Juan Dela Cruz"
                                        aria-invalid={!!errors.fullName}
                                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                                    />
                                    {errors.fullName && (
                                        <p id="fullName-error" className="text-sm text-destructive">
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="e.g. juan@company.com"
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                    {errors.email && (
                                        <p id="email-error" className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Employee ID */}
                                <div className="space-y-2">
                                    <Label htmlFor="employeeId">
                                        Employee ID <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="employeeId"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. EMP-00123"
                                        aria-invalid={!!errors.employeeId}
                                        aria-describedby={errors.employeeId ? "employeeId-error" : undefined}
                                    />
                                    {errors.employeeId && (
                                        <p id="employeeId-error" className="text-sm text-destructive">
                                            {errors.employeeId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Security</h3>
                            <div className="space-y-4 rounded-lg border p-4">
                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    {formData.password && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Password strength:</span>
                                                <span
                                                    className={cn(
                                                        "font-medium",
                                                        passwordStrength < 40 && "text-red-500",
                                                        passwordStrength >= 40 && passwordStrength < 70 && "text-yellow-500",
                                                        passwordStrength >= 70 && "text-green-500",
                                                    )}
                                                >
                                                    {getPasswordStrengthLabel(passwordStrength)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-300",
                                                        getPasswordStrengthColor(passwordStrength),
                                                    )}
                                                    style={{ width: `${passwordStrength}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && (
                                        <p id="password-error" className="text-sm text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm Password <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            aria-invalid={!!errors.confirmPassword}
                                            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                                        />
                                        {formData.confirmPassword && formData.password && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {formData.confirmPassword === formData.password ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Passwords match" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" aria-label="Passwords do not match" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.confirmPassword && (
                                        <p id="confirmPassword-error" className="text-sm text-destructive">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Work Information</h3>
                            <div className="space-y-4 rounded-lg border p-4">
                                {/* Department */}
                                <div className="space-y-2">
                                    <Label htmlFor="department">
                                        Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("department", value)}
                                        value={formData.department}
                                    >
                                        <SelectTrigger
                                            id="department"
                                            aria-invalid={!!errors.department}
                                            aria-describedby={errors.department ? "department-error" : undefined}
                                        >
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Departments</SelectLabel>
                                                <SelectItem value="hr">Human Resources</SelectItem>
                                                <SelectItem value="finance">Finance</SelectItem>
                                                <SelectItem value="it">Information Technology</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="operations">Operations</SelectItem>
                                                <SelectItem value="sales">Sales</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.department && (
                                        <p id="department-error" className="text-sm text-destructive">
                                            {errors.department}
                                        </p>
                                    )}
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        Position <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="e.g. HR Officer"
                                        aria-invalid={!!errors.position}
                                        aria-describedby={errors.position ? "position-error" : undefined}
                                    />
                                    {errors.position && (
                                        <p id="position-error" className="text-sm text-destructive">
                                            {errors.position}
                                        </p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">
                                        System Role <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange("role", value)}
                                        value={formData.role}
                                    >
                                        <SelectTrigger
                                            id="role"
                                            aria-invalid={!!errors.role}
                                            aria-describedby={errors.role ? "role-error" : undefined}
                                        >
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Roles</SelectLabel>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="hr">Human Resource</SelectItem>
                                                <SelectItem value="finance">Finance</SelectItem>
                                                <SelectItem value="talent_acquisition">Talent Acquisition</SelectItem>
                                                <SelectItem value="executive">Executive</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p id="role-error" className="text-sm text-destructive">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Creating..." : "Create User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}