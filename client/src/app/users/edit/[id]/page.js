"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import API from "@/app/utils/api";
import AdminProtectedRoute from "@/app/components/adminProtectedRoute";
import { toast } from "sonner";

// const branches = [
//   { id: 1, name: "Main Branch - Delhi" },
//   { id: 2, name: "Mumbai Central" },
//   { id: 3, name: "Bangalore City" },
//   { id: 4, name: "Chennai Outlet" },
//   { id: 5, name: "Kolkata Store" },
// ];

export default function EditUserPage() {
  const router = useRouter();
  const { id: userId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    branchId: "",
    userType: "",
    username: "",
    status: "active",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [branchIdValid, setBranchIdValid] = useState(true);
  const [originalBranchId, setOriginalBranchId] = useState(""); // Store original branchId

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await API.get(`/auth/users/${userId}`);
        const user = userResponse.data;
        // console.log("Raw user data:", user);

        let branchId = user.branch?._id || user.branchId || user.branch || "";
        if (!branchId) {
          console.warn("No valid branchId found in user data");
        }

        if (isMounted) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            branchId,
            userType: user.role || "",
            username: user.username || "",
            status: user.status || "active",
          });
          setOriginalBranchId(branchId); // Store original branchId
          // console.log("Set formData with branchId:", branchId);
        }

        // Fetch branches
        const branchResponse = await API.get("/branches/all");
        if (isMounted) {
          const fetchedBranches = branchResponse.data;
          setBranches(fetchedBranches);
          // console.log("Branches loaded:", fetchedBranches);

          // Validate branchId
          const isValidBranch =
            branchId &&
            fetchedBranches.some((branch) => branch._id === branchId);
          setBranchIdValid(isValidBranch);
          if (!isValidBranch && branchId) {
            console.warn(`BranchId ${branchId} not found in branches`);
            toast.warning("The assigned branch is invalid or not found");
            setFormData((prev) => ({ ...prev, branchId: "" }));
          }
        }

        if (isMounted) {
          setIsDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) {
          toast.error("Failed to load user or branch data");
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    // console.log(`handleSelectChange called: ${name}=${value}`);
    if (value || name !== "branchId") {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "userType" && value !== prev.userType) {
          if (value === "branch_manager" && originalBranchId) {
            // Restore original branchId if switching to branch_manager
            updated.branchId = originalBranchId;
            console.log("Restored original branchId:", originalBranchId);
          } else {
            updated.branchId = "";
            console.log("Reset branchId due to userType change:", value);
          }
        }
        return updated;
      });
    } else {
      console.warn("Ignoring empty branchId update");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const phoneRegex = /^[6-9][0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!phoneRegex.test(formData.mobile)) {
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
      await API.put(`/auth/users/${userId}`, formData);
      router.push("/users");
    } catch (error) {
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

  // Filter branches, include original branchId for branch_manager
  const filteredBranches = branches.filter((branch) => {
    if (formData.userType === "branch_manager") {
      return (
        branch.manager === null ||
        branch._id === formData.branchId ||
        branch._id === originalBranchId
      );
    }
    if (formData.userType === "packing_agent") {
      return true;
    }
    return false;
  });

  // Debug branches and formData
  useEffect(() => {
    if (isDataLoaded) {
      // console.log("All branches:", branches);
      // console.log("Filtered branches:", filteredBranches);
      // console.log("Current formData:", formData);
      // console.log("Original branchId:", originalBranchId);
      console.log("Branch with formData.branchId exists:", branchIdValid);
    }
  }, [
    branches,
    filteredBranches,
    formData,
    isDataLoaded,
    originalBranchId,
    branchIdValid,
  ]);

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
            <h1 className="text-2xl font-bold">Edit User</h1>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Update User Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Select
                      value={formData.userType || ""}
                      onValueChange={(value) =>
                        handleSelectChange("userType", value)
                      }
                      disabled={!isDataLoaded}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
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
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch</Label>
                    <Select
                      value={formData.branchId || ""}
                      onValueChange={(value) =>
                        handleSelectChange("branchId", value)
                      }
                      disabled={!isDataLoaded || !formData.userType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {/* {filteredBranches.length === 0 && (
                          <SelectItem value="" disabled>
                            No branches available
                          </SelectItem>
                        )} */}
                        {filteredBranches.map((branch) => (
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
                    {/* <div className="text-sm text-gray-500">
                      Current branchId: {formData.branchId || "None"}
                      {!branchIdValid && formData.branchId && (
                        <span className="text-red-500">
                          {" (Invalid branch)"}
                        </span>
                      )}
                    </div> */}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive">Inactive</Label>
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
                  disabled={isSubmitting || !isDataLoaded}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </AdminProtectedRoute>
  );
}
