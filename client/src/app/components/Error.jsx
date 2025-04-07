import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Error() {
  const router = useRouter();
  return (
    <Card className="border-gray-300 text-red-700 mx-5 mt-5 mb-3">
      <CardHeader>
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Order not found or the Order ID is invalid.</div>
        <Button
          className="mt-2 bg-custom-primary text-white"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </CardContent>
    </Card>
  );
}
