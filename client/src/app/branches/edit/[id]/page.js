"use client";

import { useState, useEffect } from "react";
import { TopNavigation } from "../../../components/ui/TopNavigation";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import API from "@/app/utils/api";
import AdminProtectedRoute from "@/app/components/adminProtectedRoute";

// Mock data for users (branch managers)
// const users = [
//   { id: 1, name: "John Doe" },
//   { id: 2, name: "Jane Smith" },
//   { id: 3, name: "Robert Johnson" },
//   { id: 4, name: "Emily Davis" },
//   { id: 5, name: "Michael Wilson" },
// ];

// Mock data for Indian states
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

// Mock data for branches
// const branches = [
//   {
//     id: 1,
//     name: "Main Branch - Delhi",
//     code: "MB-DEL",
//     address: "123 Main Street, New Delhi",
//     city: "New Delhi",
//     state: "Delhi",
//     pincode: "110001",
//     phone: "+91 11 2345 6789",
//     manager: "John Doe",
//     branchManagerId: "1",
//     status: "active",
//   },
//   {
//     id: 2,
//     name: "Mumbai Central",
//     code: "MB-MUM",
//     address: "456 Marine Drive, Mumbai",
//     city: "Mumbai",
//     state: "Maharashtra",
//     pincode: "400001",
//     phone: "+91 22 3456 7890",
//     manager: "Jane Smith",
//     branchManagerId: "2",
//     status: "active",
//   },
//   {
//     id: 3,
//     name: "Bangalore City",
//     code: "MB-BLR",
//     address: "789 MG Road, Bangalore",
//     city: "Bangalore",
//     state: "Karnataka",
//     pincode: "560001",
//     phone: "+91 80 4567 8901",
//     manager: "Robert Johnson",
//     branchManagerId: "3",
//     status: "active",
//   },
//   {
//     id: 4,
//     name: "Chennai Outlet",
//     code: "MB-CHN",
//     address: "321 Anna Salai, Chennai",
//     city: "Chennai",
//     state: "Tamil Nadu",
//     pincode: "600001",
//     phone: "+91 44 5678 9012",
//     manager: "Emily Davis",
//     branchManagerId: "4",
//     status: "inactive",
//   },
//   {
//     id: 5,
//     name: "Kolkata Store",
//     code: "MB-KOL",
//     address: "654 Park Street, Kolkata",
//     city: "Kolkata",
//     state: "West Bengal",
//     pincode: "700001",
//     phone: "+91 33 6789 0123",
//     manager: "Michael Wilson",
//     branchManagerId: "5",
//     status: "active",
//   },
// ];

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    pincode: "",
    manager: "",
    status: "active",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/auth/getactiveusers");
        console.log(response);
        const branchManagers = response.data.filter(
          (user) => user.role === "branch_manager"
        );
        setUsers(branchManagers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  // console.log(users);
  // Fetch branch data
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await API.get(`/branches/${branchId}`);
        const branch = response.data;
        // console.log(branch);
        if (!branch) throw new Error("Branch not found");

        setFormData({
          name: branch.name || "",
          code: branch.code || "",
          address: branch.address || "",
          city: branch.city || "",
          state: branch.state || "",
          phone: branch.phone || "",
          pincode: branch.pincode || "",
          manager: branch.manager || "",
          status: branch.status || "active",
        });
        // console.log(branch.manager?.[0]?._id);
        setIsLoading(false);
      } catch (err) {
        console.log(error);
        console.error("Error fetching branch:", err);
        setError("Failed to load branch data.");
        setIsLoading(false);
      }
    };

    fetchBranch();
  }, [branchId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.put(`/branches/${branchId}`, formData);
      router.push("/branches");
      console.log(formData);
    } catch (error) {
      console.log(error);
      console.error("Error updating branch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="icon" asChild>
              <Link href="/branches">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Edit Branch</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>Loading branch data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }
  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <TopNavigation />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="icon" asChild>
              <Link href="/branches">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Edit Branch</h1>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Branch Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Branch Name */}
                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Branch Code */}
                  <div className="space-y-2">
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input
                      id="branchCode"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 ">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        handleSelectChange("state", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pincode */}
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      required
                    />
                  </div>

                  {/* Branch Manager */}
                  {/* <div className="space-y-2">
                  <Label htmlFor="branchManagerId">Branch Manager</Label>
                  <Select
                    value={formData.manager?._id || ""}
                    className="capitalize"
                    onValueChange={(value) =>
                      handleSelectChange("manager", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem
                          key={user._id}
                          value={user._id.toString()}
                          className="capitalize"
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                  {/* <div className="space-y-2">
                    <Label htmlFor="branchManagerId">Branch Manager</Label>
                    <Select
                      value={formData.manager || ""}
                      className="capitalize"
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, manager: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/branches">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D84315] hover:bg-[#BF360C] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Update Branch"}
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
