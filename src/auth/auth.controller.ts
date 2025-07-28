import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response, type Request as TypeRequest } from 'express';
import { LoginDto } from './dto/login.dto';
import { Recaptcha } from '@nestlab/google-recaptcha';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: TypeRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res);
  }
}
