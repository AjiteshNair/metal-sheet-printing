import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider } from '@prisma/client';

type OAuthProfile = {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async findOrCreateUser(profile: OAuthProfile) {
    const existing = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
    });

    if (existing) return existing;

    // Same email signing in via a different provider than before — link to
    // the existing account rather than creating a duplicate. Reasonable
    // default; revisit if you want providers kept strictly separate.
    const byEmail = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (byEmail) return byEmail;

    return this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        provider: profile.provider,
        providerId: profile.providerId,
      },
    });
  }

  issueToken(user: { id: number; email: string; name: string; role: string }) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  // If a guest cart exists (identified by the cart_session cookie), attach
  // it to the now-logged-in user so items added before login aren't lost.
  async claimGuestCart(sessionToken: string, userId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { sessionToken } });
    if (!cart || cart.uid) return;
    await this.prisma.cart.update({ where: { id: cart.id }, data: { uid: userId } });
  }
}
