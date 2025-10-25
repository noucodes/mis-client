"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountTabs } from "@/components/account/account-tabs";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  employeeId: string;
  password?: string;
}

export default function Page() {
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    employeeId: string;
    password?: string;
  } | null>(null);
  const [tempData, setTempData] = useState<typeof user>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function getInitials(name: string) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    // take first two words only, then get first char of each
    return parts
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resuser = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(resuser.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  // Sync tempData when user changes
  useEffect(() => {
    if (user) setTempData(user);
  }, [user]);

  if (!user) {
    return (
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between" />
      </header>
    );
  }

  // // Handle form submission
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       throw new Error("No token found. Please log in.");
  //     }

  //     const response = await axios.put<User>(
  //       `${process.env.NEXT_PUBLIC_API_URL}/personal-info/${id}`,
  //       { ...personalInfo, user_id: id },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     toast.success("Personal info updated successfully!");
  //     setUser(response.data);
  //   } catch (err) {
  //     const error = err as AxiosError<{ message: string }>;
  //     console.error("Error:", error);
  //     const errorMessage = error || "Failed to update info.";
  //     setError(`${errorMessage}`);
  //     toast.error(`${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <main className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Account</span>
            <span>/</span>
            <span>Profile & Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">Profile & Settings</h1>
          <p className="text-muted-foreground text-balance">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      <AccountTabs id={user.id} />
    </main>
  );
}
