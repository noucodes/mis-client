"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

interface Applicant {
  applicant_id: string;
  full_name: string;
  employment_status: string;
  created_at: string;
  date_hired: string;
}

export function RecentApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch applicants from backend
  const fetchApplicants = async (status: string | null) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const url = status && status !== "all"
        ? `${process.env.NEXT_PUBLIC_API_URL}/applicants/status/${status}`
        : `${process.env.NEXT_PUBLIC_API_URL}/applicants/recent`;
      // Debug: Log URL and token presence
      console.log("Request URL:", url);
      console.log("Token exists:", !!token);
      console.log("Full headers:", { "Content-Type": "application/json", Authorization: `Bearer ${token}` });
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched recent applicants:", res.data); // Debug log
      setApplicants(res.data);
    } catch (error) {
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
      } else {
        console.error("Non-Axios error:", error);
      }
      setApplicants([]);
    }
  };

  // Fetch on mount and when statusFilter changes
  useEffect(() => {
    fetchApplicants(statusFilter);
  }, [statusFilter]);

  return (
    <Card className="lg:col-span-2 overflow-y-auto">
      <CardHeader>
        <CardTitle>Recent Applicants</CardTitle>
        <CardDescription>Latest applicants on the platform</CardDescription>
        <CardAction>
          <Select onValueChange={setStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter By Status</SelectLabel>
                <SelectItem value="all">All Applicants</SelectItem>
                <SelectItem value="Applicant">Applicants</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Onboarding">Hired</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {applicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent applicants found.</p>
          ) : (
            applicants.map((applicant) => (
              <div key={applicant.applicant_id} className="flex items-center">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback>{applicant.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{applicant.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(applicant.date_hired).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`ml-auto font-medium ${applicant.employment_status === "hired"
                    ? "text-green-500"
                    : applicant.employment_status === "rejected"
                      ? "text-red-500"
                      : "text-blue-500"
                    }`}
                >
                  {applicant.employment_status.charAt(0).toUpperCase() +
                    applicant.employment_status.slice(1)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}