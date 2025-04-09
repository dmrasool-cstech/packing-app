"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown";
import {
  ChevronDown,
  Building,
  Users,
  LogOut,
  LayoutDashboard,
  Menu,
  Package,
} from "lucide-react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { useAuth } from "@/app/context/adminContext";
import { useRouter } from "next/navigation";

export function TopNavigation() {
  const { userInfo, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    logout();
    if (setIsOpen) setIsOpen(false);
    // router.push("/login");
  };

  return (
    <header className="bg-[#D84315] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href={
            userInfo?.role === "branch_manager"
              ? "/manager-dashboard"
              : "/admin-dashboard"
          }
          className="flex items-center"
        >
          <img
            src="/images/meena-bazaar-logo.png"
            alt="Meena Bazaar"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href={
              userInfo?.role === "branch_manager"
                ? "/manager-dashboard"
                : "/admin-dashboard"
            }
            className="flex items-center gap-1.5"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-white focus:outline-none">
              <span>Masters</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {userInfo?.role === "branch_manager" ? (
                ""
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/branches" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Branches</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="flex items-center gap-1.5 p-0 text-base cursor-pointer"
            onClick={() => {
              // e.preventDefault();
              logout();
              // router.push("/login");
            }}
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#BF360C] focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white w-[250px] p-0">
              <SheetHeader className="bg-[#D84315] text-white p-4">
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4">
                <Link
                  href={
                    userInfo?.role === "branch_manager"
                      ? "/manager-dashboard"
                      : "/admin-dashboard"
                  }
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 text-[#D84315]" />
                  <span className="text-gray-800">Dashboard</span>
                </Link>

                <div className="px-4 py-3">
                  <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <span>Masters</span>
                  </div>
                  <div className="pl-7 flex flex-col space-y-2">
                    {userInfo?.role === "branch_manager" ? (
                      ""
                    ) : (
                      <Link
                        href="/branches"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#D84315]"
                        onClick={() => setIsOpen(false)}
                      >
                        <Building className="h-4 w-4" />
                        <span>Branches</span>
                      </Link>
                    )}
                    <Link
                      href="/users"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#D84315]"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#D84315]"
                      onClick={() => setIsOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Oders</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-auto border-t pt-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
