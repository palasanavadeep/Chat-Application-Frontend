"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store";
import { Upload } from "lucide-react";
import LabledInput from "@/components/LabledInput";
import Link from "next/link";
import Image from 'next/image'

export default function SignUpPage() {
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter()
    const { setAuthFromLogin } = useChatStore()

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("displayName", displayName ?? username);
        if (file) {
            formData.append("profileImageFile", file);
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/auth/register`, {
                method: "POST",
                body: formData
            });
            const responseData = await response.json();
            if (response.ok && responseData.success) {
                const token = responseData.data.token ?? responseData.data.accessToken ?? null
                const user = responseData.data.user ?? responseData.data.profile ?? null
                if (token && user) {
                    // persist to store (store will also persist to localStorage)
                    setAuthFromLogin(user, token)
                    router.push('/chat')
                    return
                }
                // fallback: show success but no auto-login
                alert("Registration successful!")
            } else {
                const errorData = responseData;
                alert(`Registration failed: ${errorData.message ?? responseData.status}`)
            }
        } catch (error) {
            alert("An error occurred during registration.")
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-5xl rounded-2xl shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold">Chat Application</CardTitle>
                    <p className="text-sm mt-1">Create an Account</p>
                </CardHeader>

                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Form Section */}
                        <div className="flex flex-col space-y-4">
                            <LabledInput
                                label="Username"
                                type="text"
                                placeholder="Enter your username here.."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            

                            <LabledInput
                                label="E Mail"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <LabledInput
                                label="Password"
                                type="password"
                                placeholder="**********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <LabledInput
                                label="Confirm Password"
                                type="password"
                                placeholder="**********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Right Avatar Upload Section */}
                        <div
                            className="flex flex-col justify-center space-y-4 cursor-pointer"
                            
                            
                        >
                             <LabledInput
                                label="Display Name"
                                type="text"
                                placeholder="Enter your Name here.."
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />

                            <Label>Avatar</Label>
                            <div className="flex flex-col items-center border rounded-lg p-4 bg-gray-50"
                            onClick={() => document.getElementById("fileInput")?.click()}>
                                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-white">
                                    {file ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <Upload className="text-gray-400" size={36} />
                                    )}
                                </div>
                                <p className="text-xs mt-2 text-gray-500 text-center">
                                    Please upload your image by clicking here on the box.
                                    
                                </p>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {file && (
                                    <p className="text-xs text-gray-600 truncate mt-2">{file.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Register Button */}
                    <div className="mt-8 flex flex-col items-center space-y-2">
                        <Button
                            className="w-full md:w-1/2 bg-blue-500 hover:bg-blue-600 text-white hover:cursor-pointer"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/signin" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
