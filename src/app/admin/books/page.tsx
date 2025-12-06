"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, X, Loader2, BookOpen, User, Star, MapPin, Calendar, Eye, TrendingUp, Package } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { adminService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminBooksPage() {
  const { token } = useAuth();
  const [pendingBooks, setPendingBooks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [selectedBook, setSelectedBook] = React.useState<any | null>(null);
  const [ownerDetails, setOwnerDetails] = React.useState<any | null>(null);
  const [loadingOwner, setLoadingOwner] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [viewOwnerDialog, setViewOwnerDialog] = React.useState(false);

  React.useEffect(() => {
    const fetchPending = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await adminService.getPendingBooks(token);
        setPendingBooks(response.data || []);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load pending books");
        setIsLoading(false);
      }
    };

    fetchPending();
  }, [token]);

  const fetchOwnerDetails = async (ownerId: string) => {
    if (!token) return;
    try {
      setLoadingOwner(true);
      const response = await adminService.getOwnerDetails(token, ownerId);
      setOwnerDetails(response.data);
      setLoadingOwner(false);
    } catch (error) {
      toast.error("Failed to load owner details");
      setLoadingOwner(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await adminService.approveBook(token, id);
      setPendingBooks(prev => prev.filter(b => b._id !== id));
      toast.success("Book approved successfully");
      setSelectedBook(null);
    } catch (error) {
      toast.error("Failed to approve book");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(id);
    try {
      await adminService.rejectBook(token, id, rejectionReason);
      setPendingBooks(prev => prev.filter(b => b._id !== id));
      toast.success("Book rejected");
      setSelectedBook(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject book");
    } finally {
      setActionLoading(null);
    }
  };

  const openBookDetails = (book: any) => {
    setSelectedBook(book);
    if (book.owner?._id) {
      fetchOwnerDetails(book.owner._id);
    }
  };

  const openOwnerProfile = () => {
    setViewOwnerDialog(true);
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
        <h1 className="text-3xl font-bold tracking-tight">Book Approvals</h1>
        <p className="text-muted-foreground">
          Review book images and owner profiles to verify seller eligibility.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Books ({pendingBooks.length})</CardTitle>
          <CardDescription>
            Books waiting for admin review and approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No pending books found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBooks.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell>
                      {book.image ? (
                        <div className="relative w-12 h-16 rounded overflow-hidden border">
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 rounded bg-muted flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>Rs. {book.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={book.owner?.avatar} />
                          <AvatarFallback className="text-xs">
                            {book.owner?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{book.owner?.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBookDetails(book)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Book Listing</DialogTitle>
            <DialogDescription>
              Carefully review the book details and owner profile before approval
            </DialogDescription>
          </DialogHeader>

          {selectedBook && (
            <Tabs defaultValue="book" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="book">Book Details</TabsTrigger>
                <TabsTrigger value="owner">Owner Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="book" className="space-y-4">
                {/* Book Image */}
                {selectedBook.image && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={selectedBook.image}
                      alt={selectedBook.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Book Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-base font-semibold">{selectedBook.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Author</label>
                    <p className="text-base">{selectedBook.author}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Badge variant="secondary">{selectedBook.category}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Condition</label>
                    <Badge variant="outline">{selectedBook.condition}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <p className="text-lg font-bold text-primary">Rs. {selectedBook.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Listed On</label>
                    <p className="text-sm">{format(new Date(selectedBook.createdAt), 'PPP')}</p>
                  </div>
                </div>

                {selectedBook.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedBook.description}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="owner" className="space-y-4">
                {loadingOwner ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : ownerDetails ? (
                  <>
                    {/* Owner Profile */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={ownerDetails.owner?.avatar} />
                            <AvatarFallback className="text-2xl">
                              {ownerDetails.owner?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle>{ownerDetails.owner?.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{ownerDetails.owner?.email}</p>
                            {ownerDetails.owner?.bio && (
                              <p className="text-sm mt-2">{ownerDetails.owner.bio}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {format(new Date(ownerDetails.owner?.createdAt), 'MMM yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Owner Statistics */}
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-2xl font-bold">{ownerDetails.stats?.totalBooks || 0}</p>
                              <p className="text-xs text-muted-foreground">Total Books</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold text-green-600">{ownerDetails.stats?.approvedBooks || 0}</p>
                              <p className="text-xs text-muted-foreground">Approved</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <div>
                              <p className="text-2xl font-bold">{ownerDetails.stats?.averageRating?.toFixed(1) || '0.0'}</p>
                              <p className="text-xs text-muted-foreground">Avg Rating</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold">{ownerDetails.stats?.totalSales || 0}</p>
                              <p className="text-xs text-muted-foreground">Sales</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Owner's Recent Books */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Listings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {ownerDetails.books && ownerDetails.books.length > 0 ? (
                          <div className="space-y-2">
                            {ownerDetails.books.slice(0, 5).map((book: any) => (
                              <div key={book._id} className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center gap-3">
                                  {book.image ? (
                                    <div className="relative w-10 h-14 rounded overflow-hidden">
                                      <Image src={book.image} alt={book.title} fill className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-14 rounded bg-muted flex items-center justify-center">
                                      <BookOpen className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{book.title}</p>
                                    <p className="text-xs text-muted-foreground">{book.author}</p>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    book.approvalStatus === 'approved' ? 'default' :
                                    book.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {book.approvalStatus}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No other listings</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Owner's Reviews */}
                    {ownerDetails.reviews && ownerDetails.reviews.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Recent Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {ownerDetails.reviews.slice(0, 3).map((review: any) => (
                              <div key={review._id} className="p-3 rounded border">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    on {review.book?.title}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm">{review.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Failed to load owner details</p>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Rejection reason (required for rejection)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => selectedBook && handleReject(selectedBook._id)}
                disabled={actionLoading === selectedBook?._id || !rejectionReason.trim()}
              >
                {actionLoading === selectedBook?._id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
              <Button
                onClick={() => selectedBook && handleApprove(selectedBook._id)}
                disabled={actionLoading === selectedBook?._id}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading === selectedBook?._id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
