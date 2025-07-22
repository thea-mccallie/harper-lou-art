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

/**
 * ArtistPortalPage Component
 * 
 * Protected artist management portal with Google OAuth authentication.
 * Provides three main management interfaces:
 * - Upload new artwork with multiple images
 * - Manage existing artwork (edit/delete)
 * - Edit artist bio and profile information
 * 
 * Authentication Flow:
 * 1. Shows loading state while checking authentication
 * 2. Displays login card if user is not authenticated
 * 3. Shows tabbed portal interface if user is authenticated
 * 
 * Features:
 * - Google OAuth integration via NextAuth.js
 * - Responsive tabbed interface for different management tasks
 * - User session display with sign out functionality
 * - Protected access - only authorized emails can sign in
 */

const ArtistPortalPage = () => {
  // NextAuth session management - handles authentication state
  const { data: session, status } = useSession()

  // Loading State - Show spinner while authentication status is being determined
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

  // Unauthenticated State - Show login interface
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
              {/* Google OAuth Sign In Button */}
              <Button 
                onClick={() => signIn('google')} 
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Google
              </Button>
              
              {/* Navigation back to homepage */}
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

  // Authenticated State - Show main portal interface
  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <main className="main-container px-6 py-4">
        
        {/* Portal Header with Navigation and User Info */}
        <div className="flex justify-between items-center mb-6">
          {/* Homepage Link */}
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
              Homepage
            </h1>
          </Link>
          
          {/* User Info and Sign Out */}
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
        
        {/* Main Portal Content - Tabbed Interface */}
        <Tabs defaultValue="upload" className="w-full max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Artwork</TabsTrigger>
            <TabsTrigger value="list">Artwork List</TabsTrigger>
            <TabsTrigger value="bio">Edit Bio</TabsTrigger>
          </TabsList>
          
          {/* Upload Tab - New artwork creation */}
          <TabsContent value="upload" className="mt-6">
            <UploadForm />
          </TabsContent>
          
          {/* List Tab - Manage existing artworks */}
          <TabsContent value="list" className="mt-6">
            <ArtworkList />
          </TabsContent>
          
          {/* Bio Tab - Edit artist profile information */}
          <TabsContent value="bio" className="mt-6">
            <BioEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default ArtistPortalPage;