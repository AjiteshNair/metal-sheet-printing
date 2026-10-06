import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_CLIENT_ID') || 'not-configured',
      clientSecret: config.get<string>('FACEBOOK_CLIENT_SECRET') || 'not-configured',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:9000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'displayName'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    if (!email) {
      return done(
        new Error('This Facebook account has no email on file — try Google instead, or add an email to your Facebook account.'),
        undefined,
      );
    }

    done(null, {
      provider: 'FACEBOOK' as const,
      providerId: profile.id,
      email,
      name,
    });
  }
}
