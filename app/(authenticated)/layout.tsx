import { AppSidebar } from "@/components/sidebar/app-sidebar";
import CurrentSystemTime from "@/components/system-time-display";
import SystemTimeDisplay from "@/components/system-time-display";
import { ModeToggle } from "@/components/toggle-mode";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="flex gap-4 items-center">
            <CurrentSystemTime />
            <ModeToggle />

          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
