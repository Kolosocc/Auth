import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { AuthMethod, User } from '@prisma/client';
import { type Request, type Response } from 'express';
import type { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { ProviderService } from './provider/provider.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';
import { ValidationPipe } from '@nestjs/common';

@Injectable()
export class AuthService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false
    );

    await this.emailConfirmationService.sendVerificationToken(newUser);

    return {
      message:
        'Your account has been successfully created. Please, confirm your email. The message has been sent to your email inbox',
    };
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new InternalServerErrorException('User not found');
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new InternalServerErrorException(
        'Invalid password. Try again or reset password'
      );
    }

    if (!user.isVerified) {
      await this.emailConfirmationService.sendVerificationToken(user);
      throw new UnauthorizedException('User is not verified');
    }

    return this.saveSession(req, user);
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string
  ) {
    const providerInstance = this.providerService.findByService(provider);
    const profile = await providerInstance.findUserByCode(code);

    const account = await this.prismaService.account.findFirst({
      where: {
        provider: profile.provider,
        id: profile.id.toString(),
      },
    });

    let user: User = account?.userId
      ? await this.userService.findById(account.userId)
      : null;

    if (user) {
      return this.saveSession(req, user);
    }

    user = await this.userService.create(
      profile.email,
      '',
      profile.name,
      profile.picture,
      AuthMethod[profile.provider.toUpperCase() as keyof typeof AuthMethod],
      true
    );

    if (!account) {
      await this.prismaService.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: profile.provider,
          accessToken: profile.access_token,
          refreshToken: profile.refresh_token,
          expiresAt: profile.expires_at
            ? BigInt(profile.expires_at)
            : BigInt(Date.now() + 3600 * 1000),
        },
      });
    }

    return this.saveSession(req, user);
  }

  public logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(
            new InternalServerErrorException(
              'Error destroying session: ' + err.message
            )
          );
        } else {
          res.clearCookie(this.configService.get('SESSION_NAME'));
          resolve();
        }
      });
    });
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Error saving session, check config params session: ' +
                err.message
            )
          );
        }
        resolve(user);
      });
    });
  }
}
