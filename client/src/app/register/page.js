"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import API from "../utils/api";

const registerSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "agent"]),
});

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await API.post("/auth/register", data);
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input className="input" {...register("name")} placeholder="Name" />
        <p className="text-red-500">{errors.name?.message}</p>

        <input
          className="input mt-2"
          {...register("email")}
          placeholder="Email"
        />
        <p className="text-red-500">{errors.email?.message}</p>

        <input
          type="password"
          className="input mt-2"
          {...register("password")}
          placeholder="Password"
        />
        <p className="text-red-500">{errors.password?.message}</p>

        <select className="input mt-2" {...register("role")}>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
        </select>
        <p className="text-red-500">{errors.role?.message}</p>

        <button type="submit" className="btn-primary mt-4">
          Register
        </button>
      </form>
    </div>
  );
}
