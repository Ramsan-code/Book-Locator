"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminApi, ApiError } from "@/lib/api";

// Mock data type until API is fully ready
interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const [pendingUsers, setPendingUsers] = React.useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Fetch pending users
  React.useEffect(() => {
    const fetchPending = async () => {
      try {
        // In a real scenario, we'd call adminApi.getPendingReaders()
        // For now, we'll mock it or use existing seller/deliverer endpoints if they were generic
        // Since I don't have getPendingReaders in api.ts, I'll simulate it or add it.
        // I will simulate for now as the backend is missing.
        
        // Simulation:
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPendingUsers([
          { id: "1", name: "Alice Reader", email: "alice@example.com", role: "reader", createdAt: "2023-10-27" },
          { id: "2", name: "Bob Bookworm", email: "bob@example.com", role: "reader", createdAt: "2023-10-28" },
        ]);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load pending approvals");
        setIsLoading(false);
      }
    };

    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      // await adminApi.approveUser(token, id); // Need to implement this in api.ts
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User approved successfully");
    } catch (error) {
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      // await adminApi.rejectUser(token, id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User rejected");
    } catch (error) {
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve new seller registrations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and approve new reader accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending approvals found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to reject {user.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="destructive" onClick={() => handleReject(user.id)} disabled={actionLoading === user.id}>
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to approve {user.name}? They will be granted access to the platform.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button onClick={() => handleApprove(user.id)} disabled={actionLoading === user.id}>
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Approve"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
