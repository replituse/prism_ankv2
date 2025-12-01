import { format } from "date-fns";
import { CalendarIcon, Building2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import type { Company } from "@shared/schema";

interface HeaderProps {
  title?: string;
  showDatePicker?: boolean;
  showCompanySelector?: boolean;
}

export function Header({ 
  title, 
  showDatePicker = true, 
  showCompanySelector = true 
}: HeaderProps) {
  const { selectedDate, setSelectedDate, company, setCompany } = useAuth();

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      
      {title && (
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {showCompanySelector && companies.length > 0 && (
          <Select 
            value={company?.id?.toString() || ""} 
            onValueChange={(value) => {
              const selected = companies.find(c => c.id.toString() === value);
              setCompany(selected || null);
            }}
          >
            <SelectTrigger className="w-[180px]" data-testid="header-company-select">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showDatePicker && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
                data-testid="button-date-picker"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
