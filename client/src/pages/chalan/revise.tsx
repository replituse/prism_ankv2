import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardList, Search, FileText, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { DataTable, Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChalanWithItems, ChalanRevision } from "@shared/schema";

export default function ChalanRevisePage() {
  const { toast } = useToast();
  const [selectedChalan, setSelectedChalan] = useState<ChalanWithItems | null>(null);
  const [reviseDialogOpen, setReviseDialogOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const { data: chalans = [], isLoading } = useQuery<ChalanWithItems[]>({
    queryKey: ["/api/chalans"],
  });

  const { data: revisions = [] } = useQuery<ChalanRevision[]>({
    queryKey: ["/api/chalans", selectedChalan?.id, "revisions"],
    enabled: !!selectedChalan,
  });

  const reviseMutation = useMutation({
    mutationFn: async ({ chalanId, changes }: { chalanId: number; changes: string }) => {
      return apiRequest("POST", `/api/chalans/${chalanId}/revise`, { changes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chalans"] });
      toast({ title: "Revision recorded successfully" });
      setReviseDialogOpen(false);
      setRevisionNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating revision",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ chalanId, reason }: { chalanId: number; reason: string }) => {
      return apiRequest("POST", `/api/chalans/${chalanId}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chalans"] });
      toast({ title: "Chalan cancelled successfully" });
      setSelectedChalan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error cancelling chalan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const columns: Column<ChalanWithItems>[] = [
    {
      key: "chalanNumber",
      header: "Chalan No.",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{row.chalanNumber}</span>
        </div>
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
      key: "revisions",
      header: "Revisions",
      cell: (row) => (
        <Badge variant="outline">
          {row.revisions?.length || 0} revision{(row.revisions?.length || 0) !== 1 ? "s" : ""}
        </Badge>
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
      <Header title="Chalan Revise" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {chalans.length === 0 && !isLoading ? (
              <EmptyState
                icon={ClipboardList}
                title="No chalans to revise"
                description="Create chalans first to be able to revise them."
              />
            ) : (
              <DataTable
                columns={columns}
                data={chalans}
                isLoading={isLoading}
                searchPlaceholder="Search chalans..."
                onRowClick={setSelectedChalan}
              />
            )}
          </div>

          <div className="space-y-4">
            {selectedChalan ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedChalan.chalanNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedChalan.customer?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">{selectedChalan.project?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-mono">{format(new Date(selectedChalan.chalanDate), "PPP")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-mono font-medium">
                        Rs. {(selectedChalan.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setReviseDialogOpen(true)}
                        disabled={selectedChalan.isCancelled}
                        data-testid="button-revise"
                      >
                        Create Revision
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt("Enter cancellation reason:");
                          if (reason) {
                            cancelMutation.mutate({ chalanId: selectedChalan.id, reason });
                          }
                        }}
                        disabled={selectedChalan.isCancelled || cancelMutation.isPending}
                        data-testid="button-cancel-chalan"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Revision History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {revisions.length > 0 ? (
                        <div className="space-y-3">
                          {revisions.map((revision) => (
                            <div
                              key={revision.id}
                              className="p-3 rounded-md bg-muted/50 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  Revision #{revision.revisionNumber}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {format(new Date(revision.createdAt), "PPp")}
                                </span>
                              </div>
                              {revision.changes && (
                                <p className="text-sm">{revision.changes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No revisions yet
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a chalan to view details and create revisions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={reviseDialogOpen} onOpenChange={setReviseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Revision</DialogTitle>
            <DialogDescription>
              Record changes made to chalan {selectedChalan?.chalanNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="revision-notes">Changes Description</Label>
              <Textarea
                id="revision-notes"
                placeholder="Describe the changes made..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="mt-1"
                data-testid="input-revision-notes"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviseDialogOpen(false);
                setRevisionNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedChalan && revisionNotes.trim()) {
                  reviseMutation.mutate({
                    chalanId: selectedChalan.id,
                    changes: revisionNotes,
                  });
                }
              }}
              disabled={!revisionNotes.trim() || reviseMutation.isPending}
              data-testid="button-save-revision"
            >
              {reviseMutation.isPending ? "Saving..." : "Save Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
