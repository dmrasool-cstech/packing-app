"use client";
import { TopNavigation } from "../components/ui/TopNavigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Trash, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import API from "../utils/api";
import { toast } from "sonner";
import AdminProtectedRoute from "../components/adminProtectedRoute";

const formatDate = (dateString) => {
  const date = new Date(dateString)
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");
  return date;
};

// const branches = [
//   {
//     id: 1,
//     name: "Main Branch - Delhi",
//     code: "MB-DEL",
//     address: "123 Main Street, New Delhi",
//     phone: "+91 11 2345 6789",
//     manager: "John Doe",
//     status: "Active",
//     createdAt: "2024-01-10",
//   },
//   {
//     id: 2,
//     name: "Mumbai Central",
//     code: "MB-MUM",
//     address: "456 Marine Drive, Mumbai",
//     phone: "+91 22 3456 7890",
//     manager: "Jane Smith",
//     status: "Active",
//     createdAt: "2024-02-15",
//   },
//   {
//     id: 3,
//     name: "Bangalore City",
//     code: "MB-BLR",
//     address: "789 MG Road, Bangalore",
//     phone: "+91 80 4567 8901",
//     manager: "Robert Johnson",
//     status: "Active",
//     createdAt: "2024-03-20",
//   },
//   {
//     id: 4,
//     name: "Chennai Outlet",
//     code: "MB-CHN",
//     address: "321 Anna Salai, Chennai",
//     phone: "+91 44 5678 9012",
//     manager: "Emily Davis",
//     status: "Inactive",
//     createdAt: "2024-04-25",
//   },
//   {
//     id: 5,
//     name: "Kolkata Store",
//     code: "MB-KOL",
//     address: "654 Park Street, Kolkata",
//     phone: "+91 33 6789 0123",
//     manager: "Michael Wilson",
//     status: "Active",
//     createdAt: "2024-05-30",
//   },
// ];

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for modal
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/branches/");
        const data = Array.isArray(res.data) ? res.data : [];
        console.log(res.data, data);
        setBranches(data);
        setFilteredBranches(data);
      } catch (error) {
        console.log(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Filter branches when searchTerm changes
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(term) ||
        branch.code.toLowerCase().includes(term) ||
        branch.manager?.name.toLowerCase().includes(term) ||
        branch.phone.includes(term) ||
        branch.address.toLowerCase().includes(term)
    );
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const deleteBranch = async (id) => {
    setIsDeleting(true);
    try {
      await API.delete(`/branches/${id}`);
      const updated = branches.filter((branch) => branch._id !== id);
      setBranches(updated);
      setFilteredBranches(updated);
      toast.success("Branch deleted successfully!");
    } catch (error) {
      console.error("Error deleting branch:", error);
      setError(error.message);
      toast.error("Failed to delete branch.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false); // Close modal after action
      setBranchToDelete(null); // Clear branch to delete
    }
  };

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch); // Set the branch to delete
    setIsDeleteModalOpen(true); // Open the modal
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Branches</h1>
            <Button
              className="bg-[#D84315] hover:bg-[#BF360C] text-white"
              asChild
            >
              <Link href="/branches/add">
                <Plus className="mr-2 h-4 w-4" /> Add New Branch
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Branches</CardTitle>
              <div className="flex items-center mt-2">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Creation Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches?.map((branch) => (
                    <TableRow key={branch._id}>
                      <TableCell className="font-medium">
                        {branch.name}
                      </TableCell>
                      <TableCell>{branch.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span>{branch.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-gray-500" />
                          <span>{branch.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {branch.manager?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            branch.status === "active" ? "default" : "secondary"
                          }
                          className={
                            branch.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 capitalize"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100 capitalize"
                          }
                        >
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(branch.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="cursor-pointer"
                          >
                            <Link href={`/branches/edit/${branch._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {/* <Button
                            className="cursor-pointer"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBranch(branch._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button> */}
                          <Dialog
                            open={isDeleteModalOpen}
                            onOpenChange={setIsDeleteModalOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => handleDeleteClick(branch)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {branchToDelete && (
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Deletion</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                      {branchToDelete.name}
                                    </span>
                                    ? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setIsDeleteModalOpen(false);
                                      setBranchToDelete(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="cursor-pointer bg-custom-primary text-white"
                                    onClick={() =>
                                      deleteBranch(branchToDelete._id)
                                    }
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            )}
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBranches.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-gray-500 py-6"
                      >
                        No branches found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        <footer className="bg-gray-100 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            Copyright © 2025 Meenabazaar. All rights reserved.
          </div>
        </footer>
      </div>
    </AdminProtectedRoute>
  );
}
