"use client";
import { Navbar } from "@/components/layout/navbar";
import ProfileForm from "@/components/profile/ProfileForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  });
  return (
    <>
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Personalized Fitness Coach
            </h1>
            <p className="text-lg text-gray-600">
              Lets start by setting up your profile and fitness goals
            </p>
          </div>
          <ProfileForm />
        </div>
      </main>
    </>
  );
}
