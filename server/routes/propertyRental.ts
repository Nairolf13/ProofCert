import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.ts';

const router = Router();
const prisma = new PrismaClient();

type Role = 'OWNER' | 'TENANT';

// Middleware de rôle
function requireRole(role: Role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

// Créer un bien (propriétaire)
router.post('/properties', authenticateToken, requireRole('OWNER'), async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { title, description, address, photos, country, region, city, area, price, pricePeriod, isAvailable, amenities } = req.body;
    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        photos,
        country,
        region,
        city,
        area,
        price,
        pricePeriod: pricePeriod || 'MONTH',
        isAvailable,
        amenities: amenities || [],
        ownerId: user.id,
      }
    });
    res.status(201).json(property);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la création du bien' });
  }
});

// Lister les biens (uniquement ceux de l'utilisateur connecté si OWNER)
router.get('/properties', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    let properties;
    if (user.role === 'OWNER') {
      properties = await prisma.property.findMany({ 
        where: { ownerId: user.id }, 
        include: { owner: { select: { id: true, username: true, email: true, profileImage: true } } } 
      });
    } else {
      properties = await prisma.property.findMany({ 
        include: { owner: { select: { id: true, username: true, email: true, profileImage: true } } } 
      });
    }
    res.json(properties);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des biens' });
  }
});

// Détail d'un bien (accessible à tout utilisateur connecté)
router.get('/properties/:id', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const property = await prisma.property.findUnique({ 
      where: { id: req.params.id }, 
      include: { 
        owner: { select: { id: true, username: true, email: true, profileImage: true } }, 
        proofs: true, 
        rentals: true 
      } 
    });
    if (!property) { res.status(404).json({ error: 'Not found' }); return; }
    // Plus de restriction d'accès ici : tout utilisateur connecté peut voir le détail
    res.json(property);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du bien' });
  }
});

// Mettre à jour un bien (OWNER uniquement)
router.put('/properties/:id', authenticateToken, requireRole('OWNER'), async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { id } = req.params;
    // Vérifie que le bien appartient à l'utilisateur
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) { res.status(404).json({ error: 'Not found' }); return; }
    if (property.ownerId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    const { title, description, address, photos, amenities, pricePeriod } = req.body;
    const updated = await prisma.property.update({
      where: { id },
      data: { title, description, address, photos, amenities: amenities || [], ...(pricePeriod && { pricePeriod }) },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du bien' });
  }
});

// Supprimer un bien (OWNER uniquement)
router.delete('/properties/:id', authenticateToken, requireRole('OWNER'), async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { id } = req.params;
    // Vérifie que le bien appartient à l'utilisateur
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) { res.status(404).json({ error: 'Not found' }); return; }
    if (property.ownerId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    await prisma.property.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du bien' });
  }
});

// Créer une location (rental)
router.post('/rentals', authenticateToken, requireRole('OWNER'), async (req, res) => {
  try {
    const { propertyId, tenantId, startDate, endDate } = req.body;
    const rental = await prisma.rental.create({
      data: {
        propertyId,
        tenantId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    });
    res.status(201).json(rental);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la création de la location' });
  }
});

// Lister les locations de l'utilisateur
router.get('/rentals', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    let rentals;
    if (user.role === 'OWNER') {
      rentals = await prisma.rental.findMany({ 
        where: { property: { ownerId: user.id } }, 
        include: { 
          property: true, 
          tenant: true,
          proofs: true
        } 
      });
    } else {
      rentals = await prisma.rental.findMany({ 
        where: { tenantId: user.id }, 
        include: { 
          property: true, 
          tenant: true,
          proofs: true
        } 
      });
    }
    res.json(rentals);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des locations' });
  }
});

// Ajouter une preuve (propriétaire ou locataire)
router.post('/proofs', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { title, description, contentType, hash, ipfsHash, propertyId, rentalId, isPublic } = req.body;
    const proof = await prisma.proof.create({
      data: {
        title,
        // @ts-expect-error: Prisma schema may not have description, remove if not needed
        description,
        contentType,
        hash,
        ipfsHash,
        userId: user.id,
        propertyId,
        rentalId,
        isPublic: !!isPublic,
      }
    });
    res.status(201).json(proof);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la création de la preuve' });
  }
});

// Lister les preuves d'un bien ou d'une location (filtrage par user)
router.get('/proofs', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { propertyId, rentalId } = req.query;
    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (rentalId) where.rentalId = rentalId;
    // Filtrage : un OWNER ne voit que ses preuves ou celles liées à ses biens, un TENANT que les siennes ou celles liées à ses locations
    if (user.role === 'OWNER') {
      where.OR = [
        { userId: user.id },
        { property: { ownerId: user.id } }
      ];
    } else if (user.role === 'TENANT') {
      where.OR = [
        { userId: user.id },
        { rental: { tenantId: user.id } }
      ];
    }
    const proofs = await prisma.proof.findMany({ where, include: { property: true, rental: true } });
    res.json(proofs);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des preuves' });
  }
});

// --- AJOUT : Récupérer les avis d'un bien ---
router.get('/properties/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { propertyId: req.params.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des avis' });
  }
});

// --- AJOUT : Ajouter un avis à un bien ---
router.post('/properties/:id/reviews', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { rating, comment } = req.body;
    if (!rating || !comment) { res.status(400).json({ error: 'Champs requis manquants' }); return; }
    const review = await prisma.review.create({
      data: {
        rating: Math.max(1, Math.min(5, Number(rating))),
        comment,
        propertyId: req.params.id,
        userId: user.id,
      },
      include: { user: true },
    });
    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout de l\'avis' });
  }
});

// --- AJOUT : Supprimer un avis ---
router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) { res.status(404).json({ error: 'Not found' }); return; }
    if (review.userId !== user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    await prisma.review.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'avis' });
  }
});

// Route publique pour récupérer TOUTES les propriétés disponibles (pour la recherche/découverte)
router.get('/properties/public/all', async (req, res) => {
  try {
    // Récupère toutes les propriétés disponibles, peu importe le rôle de l'utilisateur
    const properties = await prisma.property.findMany({ 
      where: { isAvailable: true },
      include: { 
        owner: { select: { id: true, username: true, email: true, profileImage: true } },
        rentals: true
      }
    });
    res.json(properties);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des biens publics' });
  }
});

// Route vraiment publique (sans authentification) pour la découverte
router.get('/properties/discover', async (req, res) => {
  try {
    // Récupère toutes les propriétés disponibles sans authentification
    const properties = await prisma.property.findMany({ 
      where: { isAvailable: true },
      include: { 
        owner: { select: { id: true, username: true, email: true, profileImage: true } },
        rentals: true
      }
    });
    res.json(properties);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des biens publics' });
  }
});

export default router;
