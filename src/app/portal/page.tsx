"use client"
import React from 'react';
import Link from 'next/link';
import UploadForm from "../components/UploadForm";
import ArtworkList from "../components/ArtworkList";
import BioEditor from "../components/BioEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ArtistPortalPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <main className="main-container px-6 py-4">
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-4xl font-light text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300">
            Homepage
          </h1>
        </Link>
        
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