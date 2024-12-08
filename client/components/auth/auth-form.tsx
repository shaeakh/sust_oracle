"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const [reg, setReg] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handlereg = (key: string, value: string) => {
    setReg({ ...reg, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (type === "register" && !otpStep) {
      // Trigger OTP Step
      try {
        await axios
          .post("http://localhost:5050/auth/registration", {
            username: reg.name,
            email: reg.email,
            password: reg.password,
          })
          .then((res) => {
            localStorage.setItem("token", res.data.token);
            setOtpStep(true);
          });
      } catch (err) {
        setError((err as any).response?.data?.message || "Registration failed");
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } else if (type === "login" && !otpStep) {
      try {
        await axios
          .post("http://localhost:5050/auth/login", {
            email: reg.email,
            password: reg.password,
          })
          .then((res) => {
            localStorage.setItem("token", res.data.token);
            if (res.status === 200 || res.status === 201) {
              router.push("/dashboard");
            }
          });
      } catch (error) {
        setError((error as any).response?.data?.message || "Login failed");
      }
    } else if (otpStep) {
      // Verify OTP
      try {
        await axios.post("http://localhost:5050/auth/registration-verify", {
          email: reg.email,
          otp,
        });
        setOtpStep(false);
        router.push("/Profile_form");
      } catch (err) {
        setError(
          (err as any).response?.data?.message || "OTP verification failed"
        );
      }
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError(""); // Clear any previous error
    try {
      await axios.post("http://localhost:5050/auth/resend-verification", {
        email: reg.email,
      });
      setOtpSent(true);
    } catch (err) {
      setError((err as any).response?.data?.message || "Failed to resend OTP");
    }
    setResendLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!otpStep ? (
          <>
            {type === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={reg.name}
                  disabled={isLoading}
                  onChange={(e) => handlereg("name", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={reg.email}
                onChange={(e) => handlereg("email", e.target.value)}
                placeholder="john@example.com"
                type="email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={reg.password}
                onChange={(e) => handlereg("password", e.target.value)}
                type="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {type === "login" ? "Sign in" : "Sign up"}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              Verify OTP
            </Button>
            {otpSent && (
              <p className="text-sm text-gray-600">OTP sent to your email</p>
            )}
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
