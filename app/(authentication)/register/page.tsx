import { RegisterForm } from "@/components/auth/register-form"
import { Phone, Play, User } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col">
                <a href="#" className="flex flex-col items-center self-center font-bold text-2xl">
                    <div className="text-primary flex  items-center justify-center rounded-md">
                        <Play className="size-12" /><User className="size-12 text-blue-400" /><Phone className="size-12" />
                    </div>
                    <div>
                        Welcome to <span className="text-blue-400">AdonPH</span>
                    </div>
                </a>
                <RegisterForm />
            </div>
        </div>
    )
}