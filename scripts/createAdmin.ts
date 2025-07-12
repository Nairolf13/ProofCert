import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Fonction pour lire l'entrée utilisateur de manière asynchrone
const question = (query: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function createAdmin() {
  try {
    console.log('🛠️  Création d\'un nouvel administrateur\n');
    
    // Demander les informations de l'administrateur
    const email = await question('📧 Email: ');
    const username = await question('👤 Nom d\'utilisateur: ');
    const password = await question('🔒 Mot de passe: ');
    const walletAddress = await question('💳 Adresse du portefeuille (optionnel, appuyez sur Entrée pour ignorer): ');
    
    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email.toLowerCase() },
          ...(walletAddress ? [{ walletAddress: walletAddress.toLowerCase() }] : [])
        ]
      }
    });

    if (existingUser) {
      console.error('❌ Un utilisateur avec cet email ou cette adresse de portefeuille existe déjà');
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(password, 12);
    
    // Créer l'utilisateur avec le rôle ADMIN
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        hashedPassword,
        walletAddress: walletAddress || null,
        role: Role.ADMIN
      },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('\n✅ Administrateur créé avec succès !\n');
    console.log('Informations de l\'administrateur:');
    console.log('----------------------------');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Nom d'utilisateur: ${user.username}`);
    console.log(`Rôle: ${user.role}`);
    if (user.walletAddress) {
      console.log(`Adresse du portefeuille: ${user.walletAddress}`);
    }
    console.log(`Date de création: ${user.createdAt}`);
    console.log('\n⚠️  Gardez ces informations en sécurité !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Démarrer le processus de création d'administrateur
createAdmin();
