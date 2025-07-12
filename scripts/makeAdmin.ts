import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(emailOrWallet: string) {
  try {
    // Vérifier si l'utilisateur existe par email ou par adresse de portefeuille
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrWallet.toLowerCase() },
          { walletAddress: emailOrWallet.toLowerCase() }
        ]
      }
    });

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email ou l'adresse de portefeuille: ${emailOrWallet}`);
      return;
    }

    // Mettre à jour le rôle de l'utilisateur en ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
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

    console.log('✅ Utilisateur mis à jour avec succès:');
    console.log(updatedUser);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rôle administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email ou l'adresse de portefeuille depuis les arguments de la ligne de commande
const emailOrWallet = process.argv[2];

if (!emailOrWallet) {
  console.error('❌ Veuillez spécifier un email ou une adresse de portefeuille');
  console.log('💡 Utilisation: npx ts-node scripts/makeAdmin.ts email@example.com');
  console.log('   ou');
  console.log('   npx ts-node scripts/makeAdmin.ts 0x1234...');
  process.exit(1);
}

makeAdmin(emailOrWallet);
