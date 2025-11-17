import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  LayoutDashboard,
  IdCardLanyard,
  SquareUserRound,
  Layers,
  List,
} from "lucide-react";

export const UserData = {
  label: "User Management",
  items: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};

export const HRData = {
  label: "Human Resource Management",
  items: [
    // {
    //   title: "Dashboard",
    //   url: "/hr/dashboard",
    //   icon: LayoutDashboard,
    // },
    {
      title: "Employee Management",
      url: "/hr/construction",
      icon: IdCardLanyard,
      items: [
        {
          title: "List of Employees",
          url: "/hr/employee-management/list",
        },
        {
          title: "Add Employee Info",
          url: "/hr/employee-management/info",
        },
        {
          title: "Employment Status History",
          url: "/hr/construction",
        },
      ],
    },
    // {
    //   title: "Masterlist of Timesheet",
    //   url: "/hr/dashboard",
    //   icon: ClipboardList,
    // },
    // {
    //   title: "Policies",
    //   url: "/hr/construction",
    //   icon: CircleAlert,
    // },
    // {
    //   title: "HMOs",
    //   url: "/hr/construction",
    //   icon: FileWarning,
    // },

    // {
    //   title: "COE Request",
    //   url: "/hr/construction",
    //   icon: GitPullRequest,
    // },

    // {
    //   title: "Leave Management",
    //   url: "/hr/construction",
    //   icon: FilePenLine,
    //   items: [
    //     {
    //       title: "Employee Leave Credits",
    //       url: "/hr/construction",
    //     },
    //     {
    //       title: "Approve/Decline Leave",
    //       url: "/hr/construction",
    //     },
    //   ],
    // },

    // {
    //   title: "Performance Review",
    //   url: "/hr/construction",
    //   icon: Spotlight,
    //   items: [
    //     {
    //       title: "Employee Evaluations",
    //       url: "/hr/construction",
    //     },
    //     {
    //       title: "Review Templates",
    //       url: "/hr/construction",
    //     },
    //   ],
    // },
  ],
};

export const HRecruitmentData = {
  label: "Recruitment Management",
  items: [
    {
      title: "Dashboard",
      url: "/recruitment/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Applicants Masterlist",
      url: "/recruitment/masterlist",
      icon: List,
    },
    {
      title: "Recruitment Process",
      url: "#",
      icon: SquareUserRound,
      items: [
        {
          title: "Dashboard",
          url: "/recruitment/applicants/dashboard",
        },
        {
          title: "List of Applicants",
          url: "/recruitment/applicants/list",
        },
        {
          title: "Status History",
          url: "/recruitment/applicants/status",
        },
      ],
    },
    //
    // {
    //   title: "Scheduling",
    //   url: "#",
    //   icon: CalendarCheck,
    // },
    {
      title: "On Boarding Process",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Dashboard",
          url: "/recruitment/onboarding/dashboard",
        },
        {
          title: "Onboarding List",
          url: "/recruitment/onboarding/checklist",
        },
      ],
    },

    {
      title: "Off Boarding Process",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Resignation Letter",
          url: "#",
        },
        {
          title: "Clearance",
          url: "#",
        },
        {
          title: "Exit Interview",
          url: "#",
        },
      ],
    },

    {
      title: "Assessment",
      url: "/recruitment/assessment",
      icon: Layers,
    },
  ],
};

export const FinanceData = {
  label: "Accounting Management",
  items: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
    },
    {
      title: "Payroll Management",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Payruns",
          url: "#",
        },
        {
          title: "Pay Computation Setups",
          url: "#",
        },
        {
          title: "Pay Items",
          url: "#",
        },
        {
          title: "Process Payroll",
          url: "#",
        },
        {
          title: "De Minimis Reference",
          url: "#",
        },
        {
          title: "Employee Last Pays",
          url: "#",
        },
        {
          title: "Disbursements",
          url: "#",
        },
        {
          title: "View Salary Summary",
          url: "#",
        },
        {
          title: "Apply Deductions (Automated)",
          url: "#",
        },
      ],
    },
    {
      title: "Tax Reports",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Generate BIR Forms",
          url: "#",
        },
        {
          title: "View Tax History",
          url: "#",
        },
      ],
    },
    {
      title: "Financial Reports",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Employee Cost Summary",
          url: "#",
        },
        {
          title: "Monthly Expenses",
          url: "#",
        },
      ],
    },
  ],
};
