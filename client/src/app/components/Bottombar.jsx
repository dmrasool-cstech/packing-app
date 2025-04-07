"use client";
import React from "react";
import { Button } from "./ui/button";
// import Home from "../page";
import { Camera, Home, Package, User } from "lucide-react";

function Bottombar() {
  return (
    <div className="border-t px-2 py-3 flex justify-around">
      <Button variant="ghost" size="icon">
        <Home className="h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-400">Home</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Camera className="h-5 w-5 text-custom-primary" />
        <span className="text-xs font-medium">Scan</span>
      </Button>
      <Button variant="ghost" size="icon">
        <Package className="h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-400">Deliveries</span>
      </Button>
      <Button variant="ghost" size="icon">
        <User className="h-5 w-5 text-gray-400" />
        <span className="text-xs text-gray-400">Profile</span>
      </Button>
    </div>
  );
}

export default Bottombar;
