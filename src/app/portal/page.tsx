"use client"
import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import UploadForm from "../components/UploadForm";
import ArtworkList from "../components/ArtworkList";
import BioEditor from "../components/BioEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, Loader2 } from "lucide-react";

const ArtistPortalPage = () => {
  const { data: session, status } = useSession()

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login page
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light">Artist Portal</CardTitle>
              <CardDescription>
                Please sign in to access the artist portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => signIn('google')} 
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Google
              </Button>
              <div className="text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Authenticated - show portal content
  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <main className="main-container px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
              Homepage
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session.user?.name}!</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="upload" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Artwork</TabsTrigger>
            <TabsTrigger value="list">Artwork List</TabsTrigger>
            <TabsTrigger value="bio">Edit Bio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <UploadForm />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <ArtworkList />
          </TabsContent>
          
          <TabsContent value="bio" className="mt-6">
            <BioEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default ArtistPortalPage;