"use client";

import { useEffect, useState } from "react";
import { TopNavigation } from "../../components/ui/TopNavigation";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus } from "lucide-react";
import API from "@/app/utils/api";
import AdminProtectedRoute from "@/app/components/adminProtectedRoute";
import { toast } from "sonner";

// Mock data for branches
// const branches = [
//   { id: 1, name: "Main Branch - Delhi" },
//   { id: 2, name: "Mumbai Central" },
//   { id: 3, name: "Bangalore City" },
//   { id: 4, name: "Chennai Outlet" },
//   { id: 5, name: "Kolkata Store" },
// ];

export default function AddUserPage() {
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  //   name, email, mobile, branch, status, userType
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    branchId: "",
    userType: "",
    password: "",
    status: "active",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await API.get("/branches/all");
        console.log(response);
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "userType") {
        updated.branchId = ""; // Reset selected branch when user type changes
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    // console.log(formData);
    e.preventDefault();
    setIsSubmitting(true);

    const phoneRegex = /^[6-9][0-9]{9}$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!phoneRegex.test(String(formData.mobile))) {
      toast.error("Enter valid mobile number");
      setIsSubmitting(false);
      return;
    }

    if (!emailRegex.test(formData.email)) {
      toast.error("Enter a valid email address");
      setIsSubmitting(false);
      return;
    }
    try {
      await API.post("/auth/users/add", formData);
      // Redirect to users list on success
      router.push("/users");
    } catch (error) {
      console.log(error);
      const errorRes = error.response?.data;

      if (errorRes?.errors) {
        Object.values(errorRes.errors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(errorRes?.error || "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Add New User</h1>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  {/* User Type */}
                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Select
                      value={formData.userType}
                      onValueChange={(value) =>
                        handleSelectChange("userType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white h-36">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="branch_manager">
                          Branch Manager
                        </SelectItem>
                        <SelectItem value="packing_agent">
                          Packing Agent
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Branch Name */}
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch Name</Label>
                    <Select
                      value={formData.branchId}
                      onValueChange={(value) =>
                        handleSelectChange("branchId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white h-36">
                        {branches
                          .filter((branch) => {
                            if (formData.userType === "branch_manager") {
                              return branch.manager === null; // Only unassigned branches
                            }
                            if (formData.userType === "packing_agent") {
                              return true; // All branches
                            }
                            return false; // Other roles don't show branches
                          })
                          .map((branch) => (
                            <SelectItem
                              key={branch._id}
                              value={branch._id}
                              className="capitalize"
                            >
                              {branch.name} - {branch.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Username */}
                  {/* <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div> */}

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active" className="cursor-pointer">
                        Active
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive" className="cursor-pointer">
                        Inactive
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/users">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save User"}
                </Button>
              </CardFooter>
            </form>
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
