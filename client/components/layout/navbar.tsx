"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface user_details {
  uid: number;
  user_name: string;
  user_image: string | null;
  user_email: string;
  age: number | null;
  gender: string | null;
  isverified: boolean;
  skills: string[] | null;
}

export function Navbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [page, setpage] = React.useState("page");
  const handleAvatarClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const [token, setToken] = React.useState("token");
  const [userinfo, setuserinfo] = React.useState<user_details>();

  const handle_logout = () => {
    localStorage.removeItem("token");
    toast.success("Logout successful");
    setDropdownOpen(false);
    setIsLoggedIn(false);
    router.push("/");
  };

  const fetch_user_info = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_IP_ADD}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          setuserinfo(res.data);
        } else {
          toast.error(res?.data?.message || "Failed to fetch user info");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to fetch user info"
        );
      });
  };
  // This useEffect checks login state on component mount.
  useEffect(() => {
    const t_token = localStorage.getItem("token");
    setToken(t_token || "token");

    if (t_token) {
      setIsLoggedIn(true);
      fetch_user_info();
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Only run once when the component mounts0
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <a href="/">
            <img
              src="https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/sust_oracle/logo.png"
              alt="ADDUTOR"
              className="w-56"
            />
          </a>
        </div>

        {/* Navigation Links */}
        {!isLoggedIn ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      " active:text-white focus:text-white hover:text-white"
                    }
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#features" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      " active:text-white focus:text-white hover:text-white"
                    }
                  >
                    Features
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#testimonials" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={
                      navigationMenuTriggerStyle() +
                      " active:text-white focus:text-white hover:text-white"
                    }
                  >
                    Testimonials
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : null}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {!isLoggedIn ? (
            <>
              <Button
                className="active:text-white focus:text-white hover:text-white"
                variant="ghost"
                asChild
              >
                <Link href="/auth">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            </>
          ) : (
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={handleAvatarClick}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 focus:outline-none"
                  >
                    <img
                      className="rounded-full"
                      src={userinfo?.user_image || ""}
                      alt={userinfo?.user_name || ""}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={page} onValueChange={setpage}>
                    <Link href="/profile">
                      <DropdownMenuRadioItem
                        className=" active:text-white focus:text-white"
                        value="Profile"
                      >
                        Profile
                      </DropdownMenuRadioItem>
                    </Link>
                    <Link href="/forum">
                      <DropdownMenuRadioItem
                        className=" active:text-white focus:text-white"
                        value="Forum"
                      >
                        Forum
                      </DropdownMenuRadioItem>
                    </Link>
                    <Link href="/admin_panel">
                      <DropdownMenuRadioItem
                        className=" active:text-white focus:text-white"
                        value="Forum"
                      >
                        Admin Panel
                      </DropdownMenuRadioItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuRadioItem
                        className=" active:text-white focus:text-white"
                        value="Settings"
                      >
                        Settings
                      </DropdownMenuRadioItem>
                    </Link>

                    <Link href="/dashboard">
                      <DropdownMenuRadioItem
                        className=" active:text-white focus:text-white"
                        value="Dashboard"
                      >
                        Dashboard
                      </DropdownMenuRadioItem>
                    </Link>
                    <DropdownMenuRadioItem
                      className=" active:text-white focus:text-white"
                      onClick={handle_logout}
                      value="Logout"
                    >
                      Logout
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
