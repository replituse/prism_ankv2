import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Filter,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { BookingCard } from "@/components/booking-card";
import { BookingForm } from "@/components/booking-form";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { BookingWithRelations, Room } from "@shared/schema";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingPage() {
  const { selectedDate, setSelectedDate } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hideCancelled, setHideCancelled] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingWithRelations | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<BookingWithRelations | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<BookingWithRelations | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: [
      "/api/bookings",
      { 
        from: format(monthStart, "yyyy-MM-dd"), 
        to: format(monthEnd, "yyyy-MM-dd") 
      },
    ],
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: bookingLogs = [] } = useQuery({
    queryKey: ["/api/bookings", viewingBooking?.id, "logs"],
    enabled: !!viewingBooking && logsDialogOpen,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return apiRequest("POST", `/api/bookings/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking cancelled successfully" });
      setCancelDialogOpen(false);
      setCancellingBooking(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error cancelling booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (hideCancelled && booking.status === "cancelled") return false;
      if (selectedRoom !== "all" && booking.roomId?.toString() !== selectedRoom) return false;
      if (selectedStatus !== "all" && booking.status !== selectedStatus) return false;
      return true;
    });
  }, [bookings, hideCancelled, selectedRoom, selectedStatus]);

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter((booking) =>
      isSameDay(new Date(booking.bookingDate), day)
    );
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleEditBooking = (booking: BookingWithRelations) => {
    setEditingBooking(booking);
    setBookingFormOpen(true);
  };

  const handleCancelBooking = (booking: BookingWithRelations) => {
    setCancellingBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleViewLogs = (booking: BookingWithRelations) => {
    setViewingBooking(booking);
    setLogsDialogOpen(true);
  };

  const handleNewBooking = (date?: Date) => {
    setEditingBooking(null);
    if (date) {
      setSelectedDate(date);
    }
    setBookingFormOpen(true);
  };

  const statusCounts = useMemo(() => {
    return {
      planning: bookings.filter((b) => b.status === "planning").length,
      tentative: bookings.filter((b) => b.status === "tentative").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Booking Calendar" />

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[180px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} data-testid="button-today">
              Today
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-booking-planning/10 border-booking-planning">
                Planning: {statusCounts.planning}
              </Badge>
              <Badge variant="outline" className="bg-booking-tentative/10 border-booking-tentative">
                Tentative: {statusCounts.tentative}
              </Badge>
              <Badge variant="outline" className="bg-booking-confirmed/10 border-booking-confirmed">
                Confirmed: {statusCounts.confirmed}
              </Badge>
              {!hideCancelled && (
                <Badge variant="outline" className="bg-booking-cancelled/10 border-booking-cancelled">
                  Cancelled: {statusCounts.cancelled}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-[160px]" data-testid="filter-room">
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]" data-testid="filter-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="tentative">Tentative</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="hide-cancelled"
              checked={hideCancelled}
              onCheckedChange={(checked) => setHideCancelled(checked as boolean)}
              data-testid="checkbox-hide-cancelled"
            />
            <Label htmlFor="hide-cancelled" className="text-sm cursor-pointer">
              <EyeOff className="h-4 w-4 inline mr-1" />
              Hide Cancelled
            </Label>
          </div>

          <div className="ml-auto">
            <Button onClick={() => handleNewBooking()} data-testid="button-new-booking">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden min-h-full">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-muted p-2 text-center text-sm font-medium sticky top-0 z-10"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "bg-background min-h-[120px] p-1 flex flex-col",
                    !isCurrentMonth && "bg-muted/30"
                  )}
                  data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm w-7 h-7 flex items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground font-medium",
                        !isCurrentMonth && "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {isCurrentMonth && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={() => handleNewBooking(day)}
                        data-testid={`button-add-booking-${format(day, "yyyy-MM-dd")}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-1">
                      {dayBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onEdit={handleEditBooking}
                          onCancel={handleCancelBooking}
                          onViewLogs={handleViewLogs}
                          compact
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  {dayBookings.length === 0 && isCurrentMonth && (
                    <div
                      className="flex-1 flex items-center justify-center border border-dashed rounded-md text-xs text-muted-foreground cursor-pointer hover-elevate"
                      onClick={() => handleNewBooking(day)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookingForm
        open={bookingFormOpen}
        onOpenChange={(open) => {
          setBookingFormOpen(open);
          if (!open) setEditingBooking(null);
        }}
        booking={editingBooking}
        defaultDate={selectedDate}
      />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Booking Details:</p>
              <p className="text-sm text-muted-foreground">
                {cancellingBooking?.customer?.name} - {cancellingBooking?.project?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {cancellingBooking?.bookingDate} ({cancellingBooking?.fromTime} - {cancellingBooking?.toTime})
              </p>
            </div>
            <div>
              <Label htmlFor="cancel-reason">Reason for Cancellation *</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1"
                data-testid="input-cancel-reason"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
              data-testid="button-cancel-dialog-close"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (cancellingBooking && cancelReason.trim()) {
                  cancelMutation.mutate({
                    id: cancellingBooking.id,
                    reason: cancelReason,
                  });
                }
              }}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Logs</DialogTitle>
            <DialogDescription>
              History of changes for this booking.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {Array.isArray(bookingLogs) && bookingLogs.length > 0 ? (
                bookingLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-md bg-muted/50 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(log.createdAt), "PPp")}
                      </span>
                    </div>
                    {log.changes && (
                      <p className="text-muted-foreground text-xs">{log.changes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No logs available for this booking.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
