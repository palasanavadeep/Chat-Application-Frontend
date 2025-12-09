"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/ChatStoreInitializer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LabledInput from "@/components/LabledInput";
import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import CustomizableAlertDialog from "@/components/CustomizableAlertDialog";
import { base64ToDataUrl } from "@/lib/utils";
import { toast } from "sonner";

interface UserProfile {
    username?: string;
    email?: string;
    // password is not persisted in store
    profileImage?: string | undefined;
    createdAt?: string | null;
    displayName?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { state, sendSocketAction } = useChatStore()
    const storeUser = state.user

    const [user, setUser] = useState<UserProfile | null>(null)

    // initialize from store when available
    useEffect(() => {
        if (!storeUser) return
        const profileImage = storeUser.profileImage?.file
        const createdAt = storeUser.createdAt
        setUser({
            username: storeUser.username ?? storeUser.displayName ?? "",
            email: storeUser.email ?? "",
            profileImage: profileImage ?? "/defaultImage.png",
            createdAt: createdAt ?? null,
            displayName: storeUser.displayName ?? "",
        })
        console.log(user?.profileImage)
    }, [storeUser])

    const handleSave = async () => {
        // TODO: implement update request
        const saved = await sendSocketAction("updateProfile",user);
        if(!saved){
            toast.error("Error in send the request to server to update the user details. !!");
        }
    };

    const handleDelete = async () => {
        // TODO: implement delete request
        alert("Account deleted!");
        
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Loading...
            </div>
        );
    }

    const imageSrc = user.profileImage
        ? // If the backend already returned a data URI, use it directly.
          user.profileImage.startsWith("data:")
            ? user.profileImage
            : // If the backend returned a path that starts with '/', use it as-is.
            user.profileImage.startsWith("/")
            ? user.profileImage
            : // Otherwise assume it's a base64-encoded string and prefix with a JPEG data URI.
            `data:image/jpeg;base64,${user.profileImage}`
        : "/next.svg"
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <Card className="w-full max-w-4xl rounded-2xl shadow-md bg-gray-900">
                <CardHeader className="relative flex justify-center items-center">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute p-2 left-4 top-4 flex items-center space-x-1 hover:bg-gray-600  cursor-pointer rounded-full"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Back</span>
                    </button>

                    <CardTitle className="text-xl font-semibold text-center">
                        My Profile
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 p-6 ">
                    {/* Left Section: Avatar */}
                    <div className="w-1/2 flex flex-col items-center space-y-2 justify-center">
                        <div className="relative flex justify-center items-center">
                            <Image
                                src={base64ToDataUrl(imageSrc)}
                                alt="Profile"
                                width={240}
                                height={240}
                                className="rounded-full object-cover border"
                            />
                            {/* <button className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 transition">
                                <Pencil size={16} />
                            </button> */}
                        </div>
                        <p className="pt-3 text-sm text-gray-400">
                            Member since{" "}
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                  })
                                : "Unknown"}
                        </p>
                    </div>

                    {/* Right Section: Form */}
                    <div className="w-full md:w-1/2 flex flex-col space-y-4">
                        <LabledInput
                            label="Display Name"
                            type="text"
                            placeholder="display name"
                            value={user.displayName ?? ""}
                            onChange={(e)=>{setUser({...user, displayName : e.target.value})}}
                        /> 
                        
                        <LabledInput
                            label="Username"
                            type="text"
                            placeholder="username"
                            value={user.username ?? ""}
                            onChange={(e)=>{setUser({...user, username : e.target.value})}}
                        />

                        <LabledInput
                            label="E Mail"
                            value={user.email ?? ""}
                            type="email"
                            placeholder="email"
                            onChange={(e)=>{setUser({...user, email : e.target.value})}}
                        />

                        {/* <div className="relative">
                            <LabledInput
                                label="Password"
                                placeholder="password"
                                type="password"
                                value={user.password}
                                onChange={(e) =>
                                    setUser({ ...user, password: e.target.value })
                                }
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-8 text-gray-600 hover:text-gray-800"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div> */}

                        <div className="flex flex-col space-y-3 pt-2">
                            <Button
                                onClick={handleSave}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Save
                            </Button>
                            {/* <Button
                                onClick={handleDelete}
                                className="w-full bg-red-400 hover:bg-red-500 text-white"
                            >
                                Delete Account
                            </Button> */}

                            {/* <CustomizableAlertDialog
                                actionName="Continue"
                                onAction={handleDelete}
                                triggerButtonLabel="Delete Account"
                                alertDialogTitle="Are you absolutely sure?"
                                alertDialogDescription={`This action cannot be undone. 
                                    This will permanently delete your account and remove your data 
                                    from our servers.`}
                                className=""
                            /> */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
