import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const CART_COOKIE = 'cart_session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Extends Express's Request type so `req.cartSessionToken` is typed
// wherever this runs — see src/types/express.d.ts.
@Injectable()
export class CartSessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies?.[CART_COOKIE];

    if (!token) {
      token = uuidv4();
      res.cookie(CART_COOKIE, token, {
        maxAge: ONE_YEAR_MS,
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    (req as any).cartSessionToken = token;
    next();
  }
}
