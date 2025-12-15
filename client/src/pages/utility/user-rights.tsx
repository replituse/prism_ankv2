import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Save, RotateCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User as UserType, UserModuleAccess } from "@shared/schema";

const MODULES = [
  {
    name: "Operations",
    sections: ["Booking", "Leaves Entry", "Chalan Entry", "Chalan Revise"],
  },
  {
    name: "Masters",
    sections: ["Customer Master", "Project Master", "Room Master", "Editor Master"],
  },
  {
    name: "Reports",
    sections: ["Conflict Report", "Booking Report", "Editor Report", "Chalan Report"],
  },
  {
    name: "Utility",
    sections: ["User Rights", "User Management"],
  },
];

interface AccessMatrix {
  [key: string]: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export default function UserRightsPage() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [accessMatrix, setAccessMatrix] = useState<AccessMatrix>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: userAccess = [], isLoading: accessLoading } = useQuery<UserModuleAccess[]>({
    queryKey: ["/api/users", selectedUserId, "access"],
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    if (userAccess.length > 0) {
      const matrix: AccessMatrix = {};
      userAccess.forEach((access) => {
        const key = `${access.module}-${access.section}`;
        matrix[key] = {
          canView: access.canView,
          canCreate: access.canCreate,
          canEdit: access.canEdit,
          canDelete: access.canDelete,
        };
      });
      setAccessMatrix(matrix);
      setHasChanges(false);
    } else if (selectedUserId) {
      setAccessMatrix({});
      setHasChanges(false);
    }
  }, [userAccess, selectedUserId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const accessList = Object.entries(accessMatrix).map(([key, value]) => {
        const [module, section] = key.split("-");
        return {
          userId: parseInt(selectedUserId),
          module,
          section,
          ...value,
        };
      });
      return apiRequest("POST", `/api/users/${selectedUserId}/access`, { access: accessList });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "access"] });
      toast({ title: "Access rights saved successfully" });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error saving access rights",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccessChange = (
    module: string,
    section: string,
    permission: "canView" | "canCreate" | "canEdit" | "canDelete",
    checked: boolean
  ) => {
    const key = `${module}-${section}`;
    setAccessMatrix((prev) => ({
      ...prev,
      [key]: {
        canView: prev[key]?.canView || false,
        canCreate: prev[key]?.canCreate || false,
        canEdit: prev[key]?.canEdit || false,
        canDelete: prev[key]?.canDelete || false,
        [permission]: checked,
      },
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    const matrix: AccessMatrix = {};
    userAccess.forEach((access) => {
      const key = `${access.module}-${access.section}`;
      matrix[key] = {
        canView: access.canView,
        canCreate: access.canCreate,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      };
    });
    setAccessMatrix(matrix);
    setHasChanges(false);
  };

  const selectedUser = users.find((u) => u.id.toString() === selectedUserId);

  return (
    <div className="flex flex-col h-full">
      <Header title="User Rights Management" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control Matrix
              </CardTitle>
              <CardDescription>
                Manage module and section-level access permissions for users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-sm">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger data-testid="select-user">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{user.username}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && (
                  <Badge variant="secondary" className="text-sm">
                    Role: {selectedUser.role}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {!selectedUserId ? (
            <EmptyState
              icon={Shield}
              title="Select a user"
              description="Choose a user from the dropdown to manage their access rights."
            />
          ) : accessLoading ? (
            <Card className="animate-pulse">
              <CardContent className="h-96" />
            </Card>
          ) : (
            <>
              {MODULES.map((module) => (
                <Card key={module.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Section</TableHead>
                          <TableHead className="text-center w-24">View</TableHead>
                          <TableHead className="text-center w-24">Create</TableHead>
                          <TableHead className="text-center w-24">Edit</TableHead>
                          <TableHead className="text-center w-24">Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {module.sections.map((section) => {
                          const key = `${module.name}-${section}`;
                          const access = accessMatrix[key] || {
                            canView: false,
                            canCreate: false,
                            canEdit: false,
                            canDelete: false,
                          };

                          return (
                            <TableRow key={section}>
                              <TableCell className="font-medium">{section}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={access.canView}
                                  onCheckedChange={(checked) =>
                                    handleAccessChange(module.name, section, "canView", checked as boolean)
                                  }
                                  data-testid={`checkbox-view-${key}`}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={access.canCreate}
                                  onCheckedChange={(checked) =>
                                    handleAccessChange(module.name, section, "canCreate", checked as boolean)
                                  }
                                  data-testid={`checkbox-create-${key}`}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={access.canEdit}
                                  onCheckedChange={(checked) =>
                                    handleAccessChange(module.name, section, "canEdit", checked as boolean)
                                  }
                                  data-testid={`checkbox-edit-${key}`}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={access.canDelete}
                                  onCheckedChange={(checked) =>
                                    handleAccessChange(module.name, section, "canDelete", checked as boolean)
                                  }
                                  data-testid={`checkbox-delete-${key}`}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}

              <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges}
                  data-testid="button-reset"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard Changes
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!hasChanges || saveMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
