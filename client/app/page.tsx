"use client";
import { Features } from "@/components/landingpage/sections/features";
import { Testimonials } from "@/components/landingpage/sections/testimonials";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 pt-16">
        <div className="container mx-auto px-6 py-16 text-center md:py-24">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Smart </span>
            Meeting Scheduling for
            <span className="block mt-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
               Community People
            </span>
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Streamline your academic meetings with our intelligent scheduling platform
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Connect with Smart People • Schedule Meetings • Track Progress
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700" asChild>
              <Link href="/register">Schedule Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50" asChild>
              <Link href="#features">How It Works</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Key Features */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold mb-12">
            Simplify Your Academic Meetings
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-violet-50">
              <Calendar className="w-12 h-12 text-violet-600 mb-4" />
              <h3 className="font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">Intelligent calendar management with conflict detection</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-violet-50">
              <Clock className="w-12 h-12 text-violet-600 mb-4" />
              <h3 className="font-semibold mb-2">Real-time Availability</h3>
              <p className="text-gray-600">See teacher's available time slots instantly</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-violet-50">
              <MessageSquare className="w-12 h-12 text-violet-600 mb-4" />
              <h3 className="font-semibold mb-2">Instant Chat</h3>
              <p className="text-gray-600">Direct communication with teachers</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-violet-50">
              <Users className="w-12 h-12 text-violet-600 mb-4" />
              <h3 className="font-semibold mb-2">Group Sessions</h3>
              <p className="text-gray-600">Organize and manage group meetings efficiently</p>
            </div>
          </div>
        </div>
      </section>

      {/* <Testimonials /> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to streamline your meetings?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Join your fellow people who are already using our platform
            for efficient meeting management.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            asChild
          >
            <Link href="/auth">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <img
                src="https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/sust_oracle/logo.png"
                alt="SUST Oracle"
                className="w-56"
              />
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-gray-600 hover:text-violet-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-violet-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-violet-600 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
