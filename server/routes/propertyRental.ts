import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, User } from '@prisma/client';
import { authenticateToken } from '../middlewares/authenticateToken.js';

// Extension de l'interface Request d'Express
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

const router = Router();
const prisma = new PrismaClient();

type UserRole = 'OWNER' | 'TENANT' | 'ADMIN';

// Middleware de rôle
function requireRole(requiredRole: UserRole | UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      if (!user || !user.role) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Si l'utilisateur est admin, il a tous les droits
      if (user.role === 'ADMIN') {
        next();
        return;
      }
      
      // Vérifier si le rôle de l'utilisateur correspond à l'un des rôles requis
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!requiredRoles.includes(user.role as UserRole)) {
        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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
  console.log('[GET /properties] user.id:', user?.id, 'user.role:', user?.role);
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    let properties;
    if (user.role === 'ADMIN') {
      // L'admin voit tout
      properties = await prisma.property.findMany({ 
        include: { owner: { select: { id: true, username: true, email: true, profileImage: true } } } 
      });
    } else {
      // Tous les autres rôles ne voient que leurs propres propriétés
      properties = await prisma.property.findMany({ 
        where: { ownerId: user.id }, 
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
        owner: { 
          select: { 
            id: true, 
            username: true, 
            email: true, 
            profileImage: true,
            walletAddress: true // Inclure l'adresse du portefeuille du propriétaire
          } 
        }, 
        proofs: true, 
        rentals: true 
      } 
    });
    if (!property) { res.status(404).json({ error: 'Not found' }); return; }
    
    // Ajouter l'adresse du portefeuille du propriétaire à la réponse
    const propertyWithOwnerAddress = {
      ...property,
      ownerWalletAddress: property.owner?.walletAddress || null
    };
    
    res.json(propertyWithOwnerAddress);
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du bien' });
  }
});

// Mettre à jour un bien (OWNER ou ADMIN)
router.put('/properties/:id', authenticateToken, requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  const user = req.user;
  try {
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { id } = req.params;
    
    // Vérifie que le bien existe
    const property = await prisma.property.findUnique({ 
      where: { id },
      include: { owner: true }
    });
    if (!property) { 
      res.status(404).json({ error: 'Property not found' }); 
      return; 
    }
    
    // Vérifie que l'utilisateur est le propriétaire ou un administrateur
    const isOwner = property.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) { 
      res.status(403).json({ 
        error: 'Forbidden: You do not have permission to update this property' 
      }); 
      return; 
    }
    const { 
      title, 
      description, 
      address, 
      photos, 
      amenities, 
      pricePeriod, 
      country, 
      region, 
      city, 
      area, 
      price, 
      isAvailable 
    } = req.body;
    
    const updated = await prisma.property.update({
      where: { id },
      data: { 
        title, 
        description, 
        address, 
        photos, 
        amenities: amenities || [], 
        pricePeriod: pricePeriod || 'MONTH',
        country,
        region,
        city,
        area: area ? Number(area) : 0,
        price: price ? Number(price) : 0,
        isAvailable: Boolean(isAvailable)
      },
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
    const property = await prisma.property.findUnique({ 
      where: { id },
      include: {
        rentals: true,
        proofs: true,
        favorites: true
      }
    });
    
    if (!property) { 
      res.status(404).json({ error: 'Property not found' }); 
      return; 
    }
    
    // Vérifier si l'utilisateur est le propriétaire ou un admin
    const isOwner = property.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) { 
      res.status(403).json({ error: 'Forbidden: You do not have permission to delete this property' }); 
      return; 
    }
    
    // Utiliser une transaction pour supprimer toutes les relations d'abord
    await prisma.$transaction([
      // Supprimer les favoris liés à cette propriété
      prisma.favorite.deleteMany({
        where: { propertyId: id }
      }),
      
      // Supprimer les preuves liées à cette propriété
      prisma.proof.deleteMany({
        where: { propertyId: id }
      }),
      
      // Supprimer les locations liées à cette propriété
      prisma.rental.deleteMany({
        where: { propertyId: id }
      }),
      
      // Enfin, supprimer la propriété elle-même
      prisma.property.delete({
        where: { id }
      })
    ]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression du bien',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Créer une location (rental)
// Route pour créer une réservation (accessible aux propriétaires et aux locataires)
router.post('/rentals', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  try {
    if (!user) {
      res.status(401).json({ error: 'Non autorisé. Utilisateur non connecté.' });
      return;
    }

    const { propertyId, startDate, endDate } = req.body;
    
    // Validation des données requises
    if (!propertyId) {
      res.status(400).json({ error: 'L\'ID de la propriété est requis' });
      return;
    }
    if (!startDate) {
      res.status(400).json({ error: 'La date de début est requise' });
      return;
    }

    // Convertir les dates en objets Date
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    // Validation des dates
    if (isNaN(startDateObj.getTime())) {
      res.status(400).json({ error: 'Format de date de début invalide' });
      return;
    }
    if (endDateObj && isNaN(endDateObj.getTime())) {
      res.status(400).json({ error: 'Format de date de fin invalide' });
      return;
    }
    if (endDateObj && startDateObj >= endDateObj) {
      res.status(400).json({ error: 'La date de début doit être antérieure à la date de fin' });
      return;
    }

    // Vérifier si la propriété existe
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      res.status(404).json({ error: 'Propriété non trouvée' });
      return;
    }

    // Créer la location avec l'ID de l'utilisateur connecté comme tenantId
    const rental = await prisma.rental.create({
      data: {
        propertyId,
        tenantId: user.id, // Utiliser l'ID de l'utilisateur connecté
        startDate: startDateObj,
        endDate: endDateObj,
      },
      include: {
        property: true,
        tenant: true
      }
    });

    res.status(201).json(rental);
  } catch (error) {
    console.error('Erreur lors de la création de la location:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de la location',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
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
