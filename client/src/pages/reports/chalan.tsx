import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileSpreadsheet, Download, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { DataTable, Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import type { ChalanWithItems, Customer } from "@shared/schema";

export default function ChalanReportPage() {
  const [fromDate, setFromDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [showCancelled, setShowCancelled] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingChalan, setViewingChalan] = useState<ChalanWithItems | null>(null);

  const { data: chalans = [], isLoading } = useQuery<ChalanWithItems[]>({
    queryKey: [
      "/api/chalans",
      {
        from: fromDate,
        to: toDate,
        customerId: selectedCustomer !== "all" ? selectedCustomer : undefined,
      },
    ],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const filteredChalans = showCancelled
    ? chalans
    : chalans.filter((c) => !c.isCancelled);

  const handleExport = () => {
    const csvContent = filteredChalans.map((c) =>
      `${c.chalanNumber},${c.customer?.name},${c.project?.name},${c.chalanDate},${c.totalAmount},${c.isCancelled ? "Cancelled" : "Active"}`
    ).join("\n");

    const blob = new Blob(
      [`Chalan No,Customer,Project,Date,Amount,Status\n${csvContent}`],
      { type: "text/csv" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chalan-report-${fromDate}-${toDate}.csv`;
    a.click();
  };

  const handleViewChalan = (chalan: ChalanWithItems) => {
    setViewingChalan(chalan);
    setViewDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = filteredChalans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const cancelledCount = chalans.filter((c) => c.isCancelled).length;

  const columns: Column<ChalanWithItems>[] = [
    {
      key: "chalanNumber",
      header: "Chalan No.",
      cell: (row) => (
        <span className="font-mono font-medium">{row.chalanNumber}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => row.customer?.name || "-",
    },
    {
      key: "project",
      header: "Project",
      cell: (row) => row.project?.name || "-",
    },
    {
      key: "chalanDate",
      header: "Date",
      cell: (row) => (
        <span className="font-mono text-sm">
          {format(new Date(row.chalanDate), "PP")}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "Amount",
      cell: (row) => (
        <span className="font-mono font-medium">
          Rs. {(row.totalAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "isCancelled",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isCancelled ? "destructive" : "default"}>
          {row.isCancelled ? "Cancelled" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Chalan Report" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="from-date">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    data-testid="input-from-date"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    data-testid="input-to-date"
                  />
                </div>
                <div>
                  <Label>Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="All customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-cancelled"
                    checked={showCancelled}
                    onCheckedChange={(checked) => setShowCancelled(checked as boolean)}
                    data-testid="checkbox-show-cancelled"
                  />
                  <Label htmlFor="show-cancelled" className="cursor-pointer">
                    Show Cancelled
                  </Label>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExport}
                  disabled={filteredChalans.length === 0}
                  data-testid="button-export"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{filteredChalans.length}</p>
                    <p className="text-xs text-muted-foreground">Total Chalans</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-booking-confirmed/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-booking-confirmed" />
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono">
                      Rs. {totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                </div>
                {cancelledCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{cancelledCount}</p>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <DataTable columns={columns} data={[]} isLoading={true} />
            ) : filteredChalans.length === 0 ? (
              <EmptyState
                icon={FileSpreadsheet}
                title="No chalans found"
                description="No chalans match the selected filters."
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredChalans}
                searchPlaceholder="Search chalans..."
                actions={(row) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewChalan(row)}
                    data-testid={`button-view-chalan-${row.id}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl print:max-w-none print:m-0 print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>Chalan Details</DialogTitle>
            <DialogDescription>
              View and print chalan details.
            </DialogDescription>
          </DialogHeader>

          {viewingChalan && (
            <div className="space-y-6 print:p-8">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">CHALAN</h2>
                <p className="text-muted-foreground">{viewingChalan.chalanNumber}</p>
                {viewingChalan.isCancelled && (
                  <Badge variant="destructive" className="mt-2">CANCELLED</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingChalan.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{viewingChalan.project?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-mono">{format(new Date(viewingChalan.chalanDate), "PPP")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Items</h4>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2 border">Description</th>
                      <th className="text-right p-2 border w-20">Qty</th>
                      <th className="text-right p-2 border w-28">Rate</th>
                      <th className="text-right p-2 border w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingChalan.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 border">{item.description}</td>
                        <td className="text-right p-2 border font-mono">{item.quantity}</td>
                        <td className="text-right p-2 border font-mono">Rs. {item.rate}</td>
                        <td className="text-right p-2 border font-mono">Rs. {item.amount}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-muted">
                      <td colSpan={3} className="text-right p-2 border">Total</td>
                      <td className="text-right p-2 border font-mono">
                        Rs. {(viewingChalan.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {viewingChalan.cancelReason && (
                <div className="p-4 bg-destructive/10 rounded-md">
                  <p className="text-sm font-medium text-destructive">Cancellation Reason</p>
                  <p className="text-sm">{viewingChalan.cancelReason}</p>
                </div>
              )}

              <div className="grid grid-cols-5 gap-4 pt-8">
                {["Prepared By", "Checked By", "Approved By", "Received By", "Authority"].map(
                  (label) => (
                    <div key={label} className="text-center">
                      <div className="border-t border-foreground pt-2 mt-12" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} data-testid="button-print-chalan">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
