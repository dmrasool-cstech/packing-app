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
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Trash } from "lucide-react";
import Link from "next/link";
import API from "../utils/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import { useAuth } from "../context/adminContext";

const formatDate = (dateString) => {
  const date = new Date(dateString)
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");
  return date;
};

// const users = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john.doe@meenabazaar.com",
//     mobile: "+91 9876543210",
//     branch: "Main Branch - Delhi",
//     status: "Active",
//     userType: "Admin",
//     createdAt: "2025-01-15",
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane.smith@meenabazaar.com",
//     mobile: "+91 9876543211",
//     branch: "Mumbai Central",
//     status: "Active",
//     userType: "Branch Manager",
//     createdAt: "2025-01-20",
//   },
// ];

export default function UsersPage() {
  const { userInfo } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/auth/users", {
          params: {
            role: userInfo.role,
            id: userInfo.id,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.log(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteUser = async (userId) => {
    try {
      await API.delete(`/auth/users/${userId}`);
      toast.success("User deleted successfully");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.mobile?.toLowerCase().includes(query) ||
      user.branchName?.toLowerCase().includes(query) ||
      user.status?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Users</h1>
            {userInfo?.role === "branch_manager" ? (
              ""
            ) : (
              <Button
                className="bg-[#D84315] hover:bg-[#BF360C] text-white"
                asChild
              >
                <Link href="/users/add">
                  <Plus className="mr-2 h-4 w-4" /> Add New User
                </Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Users</CardTitle>
              <div className="flex items-center mt-2">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Creation Date</TableHead>
                    {userInfo?.role === "branch_manager" ? (
                      ""
                    ) : (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium capitalize">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.mobile}</TableCell>
                        <TableCell>{user.branchName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        {userInfo?.role === "branch_manager" ? (
                          ""
                        ) : (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Link href={`/users/edit/${user._id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                className="cursor-pointer"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteUser(user._id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        No users found.
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
