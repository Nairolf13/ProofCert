# ProofCert - Digital Evidence Certification Platform

A modern web application for certifying digital evidence with blockchain technology and immutable storage.

## 🚀 Installation et configuration

### Prérequis

- Node.js 18+ et npm 9+
- PostgreSQL 14+
- Compte xPortal/Elrond (pour l'authentification par wallet)

### Installation des dépendances

```bash
# Installer les dépendances du projet
npm install

# Installer les dépendances de développement (si nécessaire)
npm install --include=dev

# Installer les dépendances globales (si nécessaire)
npm install -g ts-node typescript @types/node
```

### Configuration

1. Copiez le fichier `.env.example` vers `.env` et configurez les variables d'environnement :

```bash
cp .env.example .env
```

2. Modifiez le fichier `.env` pour configurer votre base de données et d'autres paramètres :

```env
# Configuration de la base de données
DATABASE_URL="postgresql://user:password@localhost:5432/proofcert?schema=public"

# Clé secrète pour les JWT
JWT_SECRET=votre_clé_secrète_très_longue_et_sécurisée

# URL de l'API (pour les liens de partage)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configuration IPFS (optionnel)
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
```

### Initialisation de la base de données

```bash
# Exécuter les migrations Prisma
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

### Démarrage de l'application

```bash
# Mode développement (frontend + backend)
npm run dev

# Ou démarrez manuellement le backend dans un terminal séparé
npm run server:dev

# Et le frontend dans un autre terminal
npm run dev
```

## 🚀 Features

- **Digital Proof Certification**: Capture and certify photos, videos, text, and audio files
- **Immutable Storage**: Store proofs on IPFS for permanent, tamper-proof evidence
- **Blockchain Security**: Generate SHA-256 hashes for cryptographic verification
- **Wallet Authentication**: Secure authentication using xPortal/Elrond wallet
- **QR Code Sharing**: Generate QR codes for easy proof verification
- **Modern UI**: Clean, responsive design inspired by Apple, Notion, and Linear
- **Real-time Dashboard**: Manage and filter your certified proofs
- **Admin Dashboard**: Manage users and access archived proofs with admin privileges

## 👨‍💻 Gestion des administrateurs

### Créer un nouvel administrateur

Pour créer un nouvel administrateur, exécutez la commande suivante et suivez les instructions :

```bash
npm run admin:create
```

### Donner les droits d'administrateur à un utilisateur existant

Pour promouvoir un utilisateur existant au rang d'administrateur, utilisez son email ou son adresse de portefeuille :

```bash
npm run admin:promote email@exemple.com
# ou
npm run admin:promote 0x1234...
```

### Fonctionnalités administrateur

- Accès à toutes les preuves, y compris celles archivées
- Gestion des utilisateurs (promotion/rétrogradation)
- Visualisation des statistiques avancées
- Accès aux journaux d'audit

## 🔧 Dépannage

### Problèmes de droits d'administration

Si vous ne parvenez pas à accéder aux fonctionnalités d'administration :

1. **Vérifiez que l'utilisateur a bien le rôle ADMIN** :
   ```sql
   SELECT id, email, "walletAddress", role FROM "User" WHERE email = 'email@exemple.com' OR "walletAddress" = '0x...';
   ```

2. **Vérifiez les logs du serveur** pour des erreurs d'authentification ou d'autorisation.

3. **Vérifiez que le token JWT contient le bon rôle** :
   - Allez sur [jwt.io](https://jwt.io/)
   - Collez votre token JWT (disponible dans les outils de développement, onglet Application > Cookies)
   - Vérifiez que le champ `role` est bien défini à `ADMIN`

4. **Si vous utilisez l'authentification par wallet** :
   - Assurez-vous que l'adresse du wallet est bien enregistrée dans la base de données
   - Vérifiez que le header `x-wallet-address` est correctement envoyé avec les requêtes

### Réinitialisation du mot de passe administrateur

Si vous avez perdu l'accès à un compte administrateur :

1. Connectez-vous à votre base de données PostgreSQL
2. Exécutez la commande suivante pour réinitialiser le mot de passe :
   ```sql
   UPDATE "User" 
   SET "hashedPassword" = '$2a$12$YOUR_NEW_PASSWORD_HASH' 
   WHERE email = 'admin@example.com';
   ```
   Remplacez `$2a$12$YOUR_NEW_PASSWORD_HASH` par un hash bcrypt d'un mot de passe de votre choix.

### Problèmes de connexion à la base de données

Si vous rencontrez des erreurs de connexion à la base de données :

1. Vérifiez que PostgreSQL est bien démarré
2. Vérifiez les informations de connexion dans le fichier `.env`
3. Assurez-vous que l'utilisateur de la base de données a les droits nécessaires

### Logs de débogage

Pour activer les logs de débogage, ajoutez les variables d'environnement suivantes :

```env
DEBUG=proofcert:*,prisma:query
NODE_ENV=development
```

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
