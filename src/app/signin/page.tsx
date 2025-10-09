"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabledInput from "@/components/LabledInput";
import Link from "next/link";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSignIn = async () => {
    try {
      const response = await fetch("https://backend-api.com/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Sign-in successful:", data);
        // Handle successful sign-in (e.g., redirect, store token, etc.)
      } else {
        console.error("Sign-in failed:", response.statusText);
        // Handle sign-in failure
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg flex flex-col items-center text-center">
        <CardHeader className="w-full text-center">
          <CardTitle className="text-2xl font-semibold">
            Chat Application
          </CardTitle>
          <p className="text-sm mt-1">Sign In</p>
        </CardHeader>

        <CardContent className="w-full flex flex-col items-center justify-center">
          <div className="w-4/5 flex flex-col space-y-4">
            <LabledInput
              label="Username"
              type="text"
              placeholder="Enter your Username here.."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <LabledInput
              label="Password"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSignIn}
            >
              Sign In
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
