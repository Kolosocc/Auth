import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 } from 'uuid';
import { ConfiramtionDto } from './dto/confirmation';
import { MailService } from 'src/libs/mail/mail.service';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class EmailConfirmationService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  public async newVerification(req: Request, dto: ConfiramtionDto) {
    const existingToken = await this.prismaService.token.findUnique({
      where: {
        token_type: {
          token: dto.token,
          type: TokenType.VERIFICATION,
        },
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Invalid token');
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();

    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }

    if (!existingToken.email) {
      throw new NotFoundException('Not find email in token');
    }

    const existingUser = await this.userService.findByEmail(
      existingToken.email
    );

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        isVerified: true,
      },
    });

    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
      },
    });

    return this.authService.saveSession(req, existingUser);
  }

  public async sendVerificationToken(user: User) {
    const verificationToken = await this.generateVerificationToken(user.email);

    await this.mailService.sendConfirmationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return true;
  }

  private async generateVerificationToken(email: string) {
    const token = v4();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 60);

    const existingToken = await this.prismaService.token.findFirst({
      where: {
        email,
        type: TokenType.VERIFICATION,
      },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const verificationToken = await this.prismaService.token.create({
      data: {
        email,
        token,
        type: TokenType.VERIFICATION,
        expiresIn,
      },
    });

    return verificationToken;
  }
}
