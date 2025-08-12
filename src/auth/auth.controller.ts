import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto } from './dto/register.dto';
import { Response, type Request as TypeRequest } from 'express';
import type { LoginDto } from './dto/login.dto';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { AuthProviderGuard } from './guards/provider.guard';
import { ConfigService } from '@nestjs/config';
import { ProviderService } from './provider/provider.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService
  ) {}

  @Post('register')
  @Recaptcha()
  @HttpCode(HttpStatus.OK)
  async register(@Request() req: TypeRequest, @Body() dto: RegisterDto) {
    return this.authService.register(req, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: TypeRequest, @Body() dto: LoginDto) {
    return this.authService.login(req, dto);
  }

  @Get('/oauth/callback/:provider')
  @UseGuards(AuthProviderGuard)
  public async callback(
    @Req() req: TypeRequest,
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
    @Param('provider') provider: string
  ) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }

    await this.authService.extractProfileFromCode(req, provider, code);
    console.log(this.configService.getOrThrow('ALLOWED_ORIGIN'));
    return res.redirect(
      `${this.configService.getOrThrow('ALLOWED_ORIGIN')}/dashboard/settings`
    );
  }

  @Get('/oauth/connect/:provider')
  @UseGuards(AuthProviderGuard)
  public async connect(@Param('provider') provider: string) {
    const providerInstance = this.providerService.findByService(provider);
    if (!providerInstance) {
      throw new BadRequestException(`Provider ${provider} not found`);
    }
    return { url: providerInstance.getAuthUrl() };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: TypeRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res);
  }
}
