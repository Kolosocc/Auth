import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { getRecaptchaConfig } from 'src/config/recaptcha.config';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRecaptchaConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
