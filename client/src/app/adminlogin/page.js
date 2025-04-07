// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { Label } from "../components/ui/label";
// import { Card, CardContent, CardHeader } from "../components/ui/card";
// import { Alert, AlertDescription } from "../components/ui/alert";
// import { LockIcon, MailIcon, AlertCircleIcon } from "lucide-react";
// import API from "../utils/api";
// import { toast } from "sonner";

// export default function LoginForm() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const [errorMessage, setErrorMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const onSubmit = async (data) => {
//     setErrorMessage("");
//     setIsLoading(true);

//     try {
//       // console.log(data);
//       const response = await API.post("/auth/login", data);
//       const { token, user } = response.data;
//       if (response.data) {
//         // Store the token and user role in localStorage
//         localStorage.setItem("usertoken", token);
//         localStorage.setItem("userrole", user.role);

//         console.log("Login successful:", token, user.role);
//       } else {
//         console.error("Login failed: No data received");
//       }

//       if (user.role === "admin") {
//         router.push("/admin-dashboard");
//       } else {
//         router.push("/not-authorized");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Inavild Credinatials");
//       // setErrorMessage(error.response?.data?.error || "Login failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md space-y-8 px-4">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold tracking-tight text-gray-900">
//             MeenaBazaar Admin
//           </h1>
//           <p className="mt-2 text-sm text-gray-600">
//             Sign in to access your admin dashboard
//           </p>
//         </div>

//         <Card className="w-full">
//           <CardHeader className="space-y-1">
//             <div className="flex justify-center">
//               <div className="rounded-full bg-[#D84315]/10 p-2">
//                 <LockIcon className="h-6 w-6 text-[#D84315]" />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {errorMessage && (
//               <Alert variant="destructive" className="mb-4">
//                 <AlertCircleIcon className="h-4 w-4" />
//                 <AlertDescription>{errorMessage}</AlertDescription>
//               </Alert>
//             )}

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                     <MailIcon className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="admin@example.com"
//                     {...register("email", { required: "Email is required" })}
//                     className="pl-10"
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password">Password</Label>
//                   <Button
//                     variant="link"
//                     className="p-0 h-auto text-xs"
//                     type="button"
//                   >
//                     Forgot password?
//                   </Button>
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   {...register("password", {
//                     required: "Password is required",
//                   })}
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-sm">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-[#D84315] hover:bg-[#BF360C] text-white"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Signing in..." : "Sign in"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
