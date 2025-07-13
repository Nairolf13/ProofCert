import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import type { Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/', async (req, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            pricePeriod: true,
            photos: true,
            city: true,
            country: true,
            description: true,
            area: true,
            isAvailable: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(favorites);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des favoris' });
  }
});

router.post('/', async (req, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!propertyId) {
      return res.status(400).json({ error: 'ID de propriété requis' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Propriété déjà dans les favoris' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        propertyId: propertyId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            pricePeriod: true,
            photos: true,
            city: true,
            country: true,
            description: true,
            area: true,
            isAvailable: true,
          },
        },
      },
    });

    res.status(201).json(favorite);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout aux favoris' });
  }
});

router.delete('/:propertyId', async (req, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    if (!existingFavorite) {
      return res.status(404).json({ error: 'Favori non trouvé' });
    }

    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du favori' });
  }
});

router.get('/check/:propertyId', async (req, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la vérification du favori' });
  }
});

router.post('/toggle', async (req, res: Response) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!propertyId) {
      return res.status(400).json({ error: 'ID de propriété requis' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({ error: 'Propriété non trouvée' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId: userId,
            propertyId: propertyId,
          },
        },
      });

      res.json({ isFavorite: false });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          userId: userId,
          propertyId: propertyId,
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              pricePeriod: true,
              photos: true,
              city: true,
              country: true,
              description: true,
              area: true,
              isAvailable: true,
            },
          },
        },
      });

      res.json({ isFavorite: true, favorite });
    }
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors du basculement du favori' });
  }
});

export default router;
