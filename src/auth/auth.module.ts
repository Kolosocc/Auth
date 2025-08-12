import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { getRecaptchaConfig } from 'src/config/recaptcha.config';
import { ProviderModule } from './provider/provider.module';
import { getProviderConfig } from 'src/config/providers.config';
import { PrismaModule } from 'src/prisma/prisma.module';

import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ConfigModule,
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRecaptchaConfig,
    }),
    ProviderModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getProviderConfig,
    }),
    forwardRef(() => EmailConfirmationModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
