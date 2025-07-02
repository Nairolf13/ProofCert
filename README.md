# ProofCert - Digital Evidence Certification Platform

A modern web application for certifying digital evidence with blockchain technology and immutable storage.

## 🚀 Features

- **Digital Proof Certification**: Capture and certify photos, videos, text, and audio files
- **Immutable Storage**: Store proofs on IPFS for permanent, tamper-proof evidence
- **Blockchain Security**: Generate SHA-256 hashes for cryptographic verification
- **Wallet Authentication**: Secure authentication using xPortal/Elrond wallet
- **QR Code Sharing**: Generate QR codes for easy proof verification
- **Modern UI**: Clean, responsive design inspired by Apple, Notion, and Linear
- **Real-time Dashboard**: Manage and filter your certified proofs

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **React Router** for navigation
- **Heroicons** for beautiful icons

### Backend (Mock Implementation)
- **Node.js** serverless functions
- **Prisma** with PostgreSQL
- **IPFS** for decentralized storage
- **JWT** for authentication

### Utilities
- **crypto-js** for SHA-256 hashing
- **qrcode** for QR code generation
- **date-fns** for date formatting
- **axios** for API calls

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ProofCert
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🗄 Database Setup

The application uses Prisma with PostgreSQL. To set up the database:

1. Install PostgreSQL
2. Create a database named \`proofcert\`
3. Update the \`DATABASE_URL\` in your \`.env\` file
4. Run Prisma migrations:
\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

## 🔧 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

## 📱 Application Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   └── Card.tsx        # Card components
├── pages/              # Application pages
│   ├── HomePage.tsx    # Landing page
│   ├── AuthPage.tsx    # Wallet authentication
│   ├── DashboardPage.tsx # User dashboard
│   ├── AddProofPage.tsx # Create new proof
│   └── ProofDetailPage.tsx # View proof details
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useProofs.ts    # Proof management hook
├── utils/              # Utility functions
│   ├── crypto.ts       # Cryptographic functions
│   ├── ipfs.ts         # IPFS utilities
│   ├── qrcode.ts       # QR code generation
│   └── helpers.ts      # General helpers
├── api/                # API client
│   └── client.ts       # API functions
└── types/              # TypeScript type definitions
    └── index.ts        # Application types
\`\`\`

## 🎨 Design System

The application uses a modern design system with:
- **Inter** font for clean typography
- **Tailwind CSS** for consistent styling
- **Primary blue** color scheme (#2563eb)
- **Responsive design** for all screen sizes
- **Accessible components** following WCAG guidelines

## 🔐 Security Features

- **SHA-256 hashing** for content verification
- **IPFS storage** for immutable data persistence
- **Wallet-based authentication** for decentralized identity
- **Privacy-focused location hashing** when GPS is available
- **Secure sharing** with unique tokens

## 🚦 Usage

1. **Connect Wallet**: Authenticate using your xPortal/Elrond wallet
2. **Create Proof**: Upload or enter content to certify
3. **Generate Hash**: Automatic SHA-256 hash generation
4. **Store on IPFS**: Content stored on decentralized network
5. **Share Proof**: Generate QR codes or shareable links
6. **Verify**: Anyone can verify proof authenticity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Commit changes: \`git commit -am 'Add feature'\`
4. Push to branch: \`git push origin feature-name\`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [xPortal Wallet](https://xportal.com)
- [IPFS Documentation](https://docs.ipfs.io)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
