import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
}
