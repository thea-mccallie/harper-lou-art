"use client"
import React from 'react';
import UploadForm from "../components/UploadForm";
import ArtworkList from "../components/ArtworkList";
import BioEditor from "../components/BioEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ArtistPortalPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <main className="main-container">
        <h1 className="page-title">Artist Portal</h1>
        
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