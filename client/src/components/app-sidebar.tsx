import { Link, useLocation } from "wouter";
import {
  Calendar,
  Users,
  Film,
  Building2,
  UserCircle,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  CalendarDays,
  UserMinus,
  AlertTriangle,
  FileSpreadsheet,
  UserCog,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

const operationsItems = [
  { title: "Booking", url: "/", icon: Calendar },
  { title: "Leaves Entry", url: "/leaves", icon: UserMinus },
  { title: "Chalan Entry", url: "/chalan", icon: FileText },
  { title: "Chalan Revise", url: "/chalan/revise", icon: ClipboardList },
];

const mastersItems = [
  { title: "Customer Master", url: "/masters/customers", icon: Users },
  { title: "Project Master", url: "/masters/projects", icon: Film },
  { title: "Room Master", url: "/masters/rooms", icon: Building2 },
  { title: "Editor Master", url: "/masters/editors", icon: UserCircle },
];

const reportsItems = [
  { title: "Conflict Report", url: "/reports/conflict", icon: AlertTriangle },
  { title: "Booking Report", url: "/reports/booking", icon: CalendarDays },
  { title: "Editor Report", url: "/reports/editor", icon: UserCog },
  { title: "Chalan Report", url: "/reports/chalan", icon: FileSpreadsheet },
];

const utilityItems = [
  { title: "User Rights", url: "/utility/user-rights", icon: Shield },
  { title: "User Management", url: "/utility/users", icon: Settings },
];

function SidebarNavGroup({
  label,
  items,
  defaultOpen = true,
}: {
  label: string;
  items: { title: string; url: string; icon: any }[];
  defaultOpen?: boolean;
}) {
  const [location] = useLocation();

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center gap-2">
            <span>{label}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { user, company, logout } = useAuth();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="text-xs">Admin</Badge>;
      case "gst":
        return <Badge variant="secondary" className="text-xs">GST</Badge>;
      case "non_gst":
        return <Badge variant="outline" className="text-xs">Non-GST</Badge>;
      default:
        return null;
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Film className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">PRISM</h2>
            <p className="text-xs text-muted-foreground truncate">
              {company?.name || "No company"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarNavGroup label="Operations" items={operationsItems} defaultOpen={true} />
        <SidebarNavGroup label="Masters" items={mastersItems} defaultOpen={false} />
        <SidebarNavGroup label="Reports" items={reportsItems} defaultOpen={false} />
        <SidebarNavGroup label="Utility" items={utilityItems} defaultOpen={false} />
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs font-medium">
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {user?.username || "User"}
              </span>
              {user?.role && getRoleBadge(user.role)}
            </div>
          </div>
          <SidebarMenuButton
            size="sm"
            className="h-8 w-8 p-0"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
