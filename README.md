# Harper Lou Art Portfolio

> A modern, responsive portfolio website for showcasing artwork with an integrated artist management portal.

![Project Banner](/.github/images/banner.png)

[![harperlouart.com](https://img.shields.io/badge/demo-live-green.svg)](https://your-domain.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Components](#components)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎨 Overview

Harper Lou Art is a full-stack portfolio website designed for an artist to showcase their work with a professional, gallery-like presentation. The project features a public-facing portfolio with category filtering and a secure artist portal for content management.

### Key Highlights
- **Responsive Design**: Mobile-first approach with elegant grid layouts
- **Artist Portal**: Secure content management system with Google OAuth
- **Image Management**: S3 integration with drag-and-drop reordering
- **Category Filtering**: Dynamic artwork filtering by medium
- **Modern UI**: Built with Shadcn/UI components and Tailwind CSS

## ✨ Features

### Public Portfolio
- [x] Responsive artwork gallery with grid layout
![Artwork hover](/.github/images/homepage_interactive.png)
- [x] Category-based filtering (Ceramics, Paintings, Prints)
![Filter](/.github/images/filtered_homepage.png)
- [x] Individual artwork detail pages with image carousel
![Artwork page](/.github/images/artwork.png)
- [x] Artist bio and about page
![Bio](/.github/images/bio.png)
- [x] Instagram integration
- [x] Copy and paste email
![Email copy](/.github/images/email_copy.png)
- [x] Mobile-optimized design
![mobile1](/.github/images/mobile1.png)
![mobile2](/.github/images/mobile2.png)
![mobile3](/.github/images/mobile3.png)

### Artist Portal
![artwork upload](/.github/images/upload_artwork.png)
- [x] Google OAuth authentication with email authorization
- [x] Multi-image artwork upload with S3 integration
- [x] Artworks and bio information stored with DynamoDB
- [x] Drag-and-drop image reordering
![Image reorder](/.github/images/image_reorder.png)
- [x] Artwork management (edit/delete existing pieces)
![Artwork List page](/.github/images/artwork_list.png)
![Artwork editor](/.github/images/artwork_editor.png)
- [x] Bio editor with profile image upload
![Bio editor](/.github/images/bio_editor.png)
- [x] Real-time preview and validation

### Technical Features
- [x] Server-side rendering with Next.js App Router
- [x] TypeScript for type safety
- [x] AWS S3 integration with presigned URLs
- [x] Responsive design with Tailwind CSS
- [x] Component documentation and testing ready
- [x] DynamoDB for scalability and predictable performance


## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15.1.6](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/)

### Backend & Database
- **Runtime**: [Node.js](https://nodejs.org/)
- **API**: Next.js API Routes
- **Database**: Amazon DynamoDB NoSQL database

### Authentication & Storage
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/) with presigned URLs
- **Image Processing**: Browser-native with preview generation

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Formatting**: [Can be added - Prettier not currently configured]
- **Version Control**: Git with GitHub

## 🏗 Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│  Next.js App    │───▶│  API Routes     │───▶│  AWS S3         │
│  React Components│    │  Authentication │    │  Google OAuth   │
│  Tailwind CSS   │    │  Database Ops   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **Public Portfolio**: Static/SSR pages fetch artwork data via API routes
2. **Authentication**: NextAuth.js handles Google OAuth with email validation
3. **Image Upload**: Presigned S3 URLs enable direct browser-to-S3 uploads
4. **Content Management**: Protected API routes handle CRUD operations

## 📁 Project Structure

```
harper-lou-art/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage with artwork grid
│   │   ├── about/             # About page
│   │   ├── artwork/[id]/      # Individual artwork pages
│   │   ├── portal/            # Protected artist portal
│   │   ├── api/               # API routes
│   │   │   ├── artworks/      # Artwork CRUD operations
│   │   │   ├── auth/          # NextAuth configuration
│   │   │   ├── bio/           # Bio management
│   │   │   └── upload-url/    # S3 presigned URL generation
│   │   └── components/        # React components
│   │       ├── ArtworkCard.tsx
│   │       ├── ArtworkList.tsx
│   │       ├── BioEditor.tsx
│   │       ├── EditArtworkModal.tsx
│   │       └── UploadForm.tsx
│   ├── components/ui/         # Shadcn/UI components
│   ├── lib/                   # Utility functions
│   └── styles/               # CSS files
├── public/                   # Static assets
├── .github/                  # GitHub assets and documentation
│   └── images/              # README images and screenshots
└── [config files]           # Next.js, TypeScript, Tailwind configs
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS account with S3 bucket
- Google OAuth credentials

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/thea-mccallie/harper-lou-art.git
   cd harper-lou-art
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your-database-connection-string"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000" - eventually [your-domain]
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Artist Authorization (comma-separated emails)
AUTHORIZED_EMAILS="artist@example.com,admin@example.com"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-s3-bucket-name"
```

### AWS S3 Setup
1. Create an S3 bucket with public read access
2. Configure CORS for your domain
3. Set up IAM user with S3 permissions
4. Add credentials to environment variables

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

## 📱 Usage

### For Visitors
- Browse artwork collections on the homepage
- Filter by category (Ceramics, Paintings, Prints)
- View individual artwork details
- Read artist bio on the About page
- Follow Instagram link for latest updates

### For Artists (Portal Access)
1. Navigate to `/portal`
2. Sign in with authorized Google account
3. Use the tabbed interface to:
   - Upload new artwork with multiple images
   - Edit existing artwork details and images
   - Update bio and profile information

## 📚 API Reference

### Artworks
- `GET /api/artworks` - Fetch all artworks
- `POST /api/artworks` - Create new artwork (protected)
- `GET /api/artworks/[id]` - Fetch specific artwork
- `PUT /api/artworks/[id]` - Update artwork (protected)
- `DELETE /api/artworks/[id]` - Delete artwork (protected)

### Bio
- `GET /api/bio` - Fetch artist bio
- `PUT /api/bio` - Update bio (protected)

### Upload
- `POST /api/upload-url` - Generate S3 presigned URL (protected)

### Authentication
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in with provider
- `POST /api/auth/signout` - Sign out

## 🧩 Components

### Public Components
- **ArtworkCard**: Individual artwork display with hover effects
- **Homepage**: Main gallery with filtering functionality
- **About Page**: Artist bio and profile information

### Portal Components
- **UploadForm**: Multi-image upload with drag-and-drop reordering
- **ArtworkList**: Management interface for existing artworks
- **EditArtworkModal**: Modal for editing artwork details and images
- **BioEditor**: Profile and bio editing interface

### UI Components (Shadcn/UI)
- Cards, Buttons, Inputs, Modals
- Tabs, Alerts, Badges
- Custom styling with Tailwind CSS


## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push


### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] AWS S3 bucket set up with proper permissions
- [ ] Google OAuth configured for production domain
- [ ] Database connected and migrated
- [ ] Authorized emails list updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with 🩵🧡🩷 for art and artsits**