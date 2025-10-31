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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg flex flex-col items-center text-center py-8">
        <CardHeader className="w-full text-center">
          <CardTitle className="text-2xl font-semibold">
            Chat Application
          </CardTitle>
          <p className="text-sm mt-1 text-gray-600">Sign In</p>
        </CardHeader>

        <CardContent className="w-full flex flex-col items-center justify-center mt-4">
          <div className="w-full max-w-sm flex flex-col space-y-4">
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all"
              onClick={handleSignIn}
            >
              Sign In
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
