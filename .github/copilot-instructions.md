<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# ProofCert Application

This is a React TypeScript web application for proof certification with the following key features:

## Tech Stack
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + Headless UI
- Backend: Node.js serverless functions with Prisma + MySQL
- Storage: IPFS/Arweave for immutable proof storage
- Authentication: xPortal/Elrond wallet integration

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow React functional components with hooks
- Use Tailwind CSS for styling with modern, clean design
- Implement responsive, mobile-first design
- Use proper error handling and loading states
- Follow accessibility best practices

## Key Features to Implement
- Proof capture (photo, text, video, audio)
- SHA-256 hash generation
- IPFS/Arweave storage
- QR code generation for sharing
- Wallet authentication
- Dashboard with filtering
- Responsive UI inspired by Apple/Notion/Linear

## Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions
- `/src/types` - TypeScript type definitions
- `/src/api` - API client functions
- `/prisma` - Database schema and migrations
