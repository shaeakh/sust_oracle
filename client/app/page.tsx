"use client";
import { Features } from "@/components/landingpage/sections/features";
import { Testimonials } from "@/components/landingpage/sections/testimonials";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="relative bg-background pt-16">
        <div className="container mx-auto px-6 py-16 text-center md:py-24">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Transform Your Fitness Journey
            <span className="text-primary"> Today</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Track your progress, achieve your goals, and stay motivated with our
            AI-powered fitness platform. Join thousands of users who have
            already transformed their lives.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Start Your Journey</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </header>

      <Features />
      <Testimonials />

      {/* CTA Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your fitness journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Join thousands of users who have already transformed their lives
            with our platform.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span className="text-xl font-bold">Project Name</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
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
