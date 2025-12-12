"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Settings, UserCheck, DollarSign, Mail, Loader2 } from "lucide-react";
import { adminService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [pendingCommissions, setPendingCommissions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sharingLoading, setSharingLoading] = React.useState<string | null>(null);
  const [commissionRate, setCommissionRate] = React.useState(0.08); // Default fallback

  const fetchSettings = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminService.getSettings(token);
      if (res.success) {
        const commissionSetting = res.data.find((s: any) => s.key === "commission_rate");
        if (commissionSetting) {
          setCommissionRate(commissionSetting.value);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      // Use default 0.08 if fetch fails
    }
  }, [token]);

  const fetchCommissions = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminService.getPendingCommissions(token);
      if (res.success) {
        setPendingCommissions(res.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch commissions", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchSettings();
    fetchCommissions();
  }, [fetchSettings, fetchCommissions]);

  const handleShareContact = async (transactionId: string) => {
    if (!token) return;
    setSharingLoading(transactionId);
    try {
      await adminService.shareContactInfo(token, transactionId);
      toast.success("Contact info shared successfully!");
      fetchCommissions(); // Refresh list
    } catch (error) {
      toast.error("Failed to share contact info");
    } finally {
      setSharingLoading(null);
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: "0",
      description: "Registered users in the system",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Pending Approvals",
      value: "0",
      description: "Users waiting for approval",
      icon: CheckCircle,
      href: "/admin/approvals",
    },
    {
      title: "Pending Commissions",
      value: pendingCommissions.length.toString(),
      description: "Transactions waiting for payment",
      icon: DollarSign,
      href: "#commissions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted">
      <div className="container max-w-7xl py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, approvals, and system settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve reader registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/approvals">
                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  View Approvals
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending Commissions Section */}
        <div id="commissions" className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-success" />
            Pending Commissions & Contact Sharing
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Transactions Waiting for Commission</CardTitle>
              <CardDescription>
                Monitor payments and share contact information when both parties have paid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending commissions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted">
                      <tr>
                        <th className="px-6 py-3">Book</th>
                        <th className="px-6 py-3">Buyer Status</th>
                        <th className="px-6 py-3">Seller Status</th>
                        <th className="px-6 py-3">Total Commission</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCommissions.map((tx) => {
                        const bothPaid = tx.buyerCommissionPaid && tx.sellerCommissionPaid;
                        const commissionAmount = tx.commissionAmount || (tx.price * commissionRate);
                        
                        return (
                          <tr key={tx._id} className="bg-background border-b hover:bg-muted">
                            <td className="px-6 py-4 font-medium text-foreground">
                              {tx.book?.title}
                              <div className="text-xs text-muted-foreground">Price: Rs. {tx.price}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{tx.buyer?.name}</span>
                                {tx.buyerCommissionPaid ? (
                                  <Badge className="bg-success w-fit">Paid</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-warning border-warning/20 w-fit">Pending</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{tx.seller?.name}</span>
                                {tx.sellerCommissionPaid ? (
                                  <Badge className="bg-success w-fit">Paid</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-warning border-warning/20 w-fit">Pending</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-success">
                                Rs. {(commissionAmount * 2).toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                (Rs. {commissionAmount.toFixed(2)} × 2)
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {tx.status === 'commission_paid' || bothPaid ? (
                                <Button 
                                  size="sm" 
                                  className="bg-info hover:bg-info/90"
                                  onClick={() => handleShareContact(tx._id)}
                                  disabled={sharingLoading === tx._id}
                                >
                                  {sharingLoading === tx._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                  )}
                                  Share Contact Info
                                </Button>
                              ) : (
                                <Button size="sm" variant="secondary" disabled>
                                  Waiting for Payments
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
