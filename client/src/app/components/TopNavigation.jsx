"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown";
import {
  ChevronDown,
  Building,
  Users,
  LogOut,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

export function TopNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#D84315] text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <img
            src="/images/meena-bazaar-logo.png"
            alt="Meena Bazaar"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-white focus:outline-none">
              <span>Masters</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/branches" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Branches</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/" className="flex items-center gap-1.5">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
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
                  href="/dashboard"
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
                    <Link
                      href="/branches"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#D84315]"
                      onClick={() => setIsOpen(false)}
                    >
                      <Building className="h-4 w-4" />
                      <span>Branches</span>
                    </Link>
                    <Link
                      href="/users"
                      className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#D84315]"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-auto border-t pt-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
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
