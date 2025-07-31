import { ConfigService } from '@nestjs/config';
import { TypeOptions } from 'src/auth/provider/provider.constants';
import { GithubProvider } from 'src/auth/provider/services/github.provider';
import { GoogleProvider } from 'src/auth/provider/services/google.provider';

import { YandexProvider } from 'src/auth/provider/services/yandex.provider';

export const getProviderConfig = async (
  configService: ConfigService
): Promise<TypeOptions> => {
  const config = {
    baseUrl: configService.getOrThrow<string>('OAUTH_BASE_URL'),
    services: [
      new GoogleProvider({
        client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile'],
      }),
      new YandexProvider({
        client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
        client_secret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
        scopes: ['login:email', 'login:info'],
      }),
      new GithubProvider({
        client_id: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
        client_secret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
        scopes: ['user', 'user:email'],
      }),
    ],
  };
  console.log('Provider config:', config); // Отладочный вывод
  return config;
};
