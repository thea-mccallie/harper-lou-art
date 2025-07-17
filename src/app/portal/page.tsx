"use client"
import React, { useState } from 'react';
import UploadForm from "../components/UploadForm";
import ArtworkList from "../components/ArtworkList";
import BioEditor from "../components/BioEditor"; // Ensure BioEditor is imported

const ArtistPortalPage = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)]">
      <main className="main-container">
        <h1 className="page-title">Artist Portal</h1>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "upload" ? "tab-button-active" : "tab-button-inactive"}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Artwork
          </button>
          <button
            className={`tab-button ${activeTab === "list" ? "tab-button-active" : "tab-button-inactive"}`}
            onClick={() => setActiveTab("list")}
          >
            Artwork List
          </button>
          <button
            className={`tab-button ${activeTab === "bio" ? "tab-button-active" : "tab-button-inactive"}`}
            onClick={() => setActiveTab("bio")}
          >
            Edit Bio
          </button>
        </div>
        {activeTab === "upload" && <UploadForm />}
        {activeTab === "list" && <ArtworkList />}
        {activeTab === "bio" && <BioEditor />}
      </main>
    </div>
  );
}

export default ArtistPortalPage;