"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  ArrowLeft,
  HomeIcon,
  KeyRound,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/adminContext";
import AdminProtectedRoute from "../components/adminProtectedRoute";
import { toast } from "sonner";
import API from "../utils/api";

export default function Profile() {
  const { userInfo } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // If not already editing, switch to edit mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // If already editing, perform validation and submit
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    if (formData.password) {
      submitData.append("password", formData.password);
    }

    try {
      console.log(submitData);
      await API.put(`/auth/change-password/${userInfo.id}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      // toast.error("Error updating profile");
      const errorRes = error.response?.data;

      if (errorRes?.errors) {
        Object.values(errorRes.errors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(errorRes?.error || "Something went wrong");
      }
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="flex flex-col h-screen bg-white">
        {/* Top Bar */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Profile</h1>
          <div className="w-9" />
        </div>

        {/* Profile Form */}
        <div className="flex-1 px-5 py-6 overflow-auto">
          <form className="space-y-5" onSubmit={handleUpdate}>
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Full Name
              </label>
              <Input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`h-12 rounded-xl px-4 ${
                  isEditing
                    ? "bg-white border border-gray-300 text-black"
                    : "bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`h-12 rounded-xl px-4 ${
                  isEditing
                    ? "bg-white border border-gray-300 text-black"
                    : "bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Role (Always Disabled) */}
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                Role
              </label>
              <Input
                type="text"
                value={userInfo?.role || ""}
                disabled
                className="h-12 rounded-xl bg-gray-100 border border-gray-200 px-4 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Password Inputs (Only when editing) */}

            <>
              <label className="text-sm font-medium ml-1 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-gray-500" /> Change Password
              </label>
              <div className="space-y-2">
                <Input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={formData.password}
                  disabled={!isEditing}
                  onChange={handleChange}
                  required={true}
                  className="h-12 rounded-xl border border-gray-300 px-4"
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  disabled={!isEditing}
                  onChange={handleChange}
                  required={true}
                  className="h-12 rounded-xl border border-gray-300 px-4"
                />
              </div>
            </>

            {/* Action Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-custom-primary text-white flex items-center justify-center gap-2"
            >
              {isEditing ? "Update Profile" : "Edit Profile"}
            </Button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t px-2 py-3 flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <HomeIcon className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center h-auto gap-1 text-[#c83d15] hover:bg-gray-100 cursor-pointer"
          >
            <User className="h-5 w-5 text-[#c83d15]" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
        </div>

        <div className="h-1 w-32 bg-gray-300 rounded-full mx-auto mb-2"></div>
      </div>
    </AdminProtectedRoute>
  );
}
