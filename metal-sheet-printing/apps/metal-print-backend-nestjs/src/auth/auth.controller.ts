import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const AUTH_COOKIE = 'auth_token';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // keep in sync with JWT_EXPIRES_IN

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  private async handleOAuthCallback(req: Request, res: Response) {
    const profile = req.user as any;
    const user = await this.authService.findOrCreateUser(profile);
    const token = this.authService.issueToken(user);

    const sessionToken = req.cookies?.['cart_session'];
    if (sessionToken) {
      await this.authService.claimGuestCart(sessionToken, user.id);
    }

    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    res.redirect(`${this.config.get<string>('FRONTEND_URL')}/`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return { user };
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie(AUTH_COOKIE);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}/`);
  }
}
