"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PersonalInfo } from "./personal-info";
import { EmployeeInfo } from "./employee-info";
import { Contribution } from "./contribution";
import { UserInfo } from "./user";

export function AccountTabs({ id }: { id: number }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      toast.error("No token found. Please log in.");
    }
  }, []);


  return (
    <main className="flex-1 overflow-auto" >
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full md:w-3/5   lg:w-4/5 grid-cols-4">
          <TabsTrigger value="user">User Info</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employee">Employee Info</TabsTrigger>
          <TabsTrigger value="contribution">Contribution</TabsTrigger>
        </TabsList>

        {/* PERSONAL INFO */}
        <TabsContent value="personal" className="mt-6">
          <PersonalInfo id={id} token={token} />
        </TabsContent>

        {/* EMPLOYEE INFO */}
        <TabsContent value="employee" className="mt-6">
          <EmployeeInfo id={id} token={token} />
        </TabsContent>

        {/* CONTRIBUTION */}
        <TabsContent value="contribution" className="mt-6">
          <Contribution id={id} token={token} />
        </TabsContent>

        {/* PROFILE */}
        <TabsContent value="user" className="mt-6">
          <UserInfo id={id} token={token} />
        </TabsContent>
      </Tabs>
    </main >
  );
}
