import { BaseOAuthService } from './services/base-oath.service';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const ProviderOptionsSymbol = Symbol('ProviderOptions');

export type TypeOptions = {
  baseUrl: string;
  services: BaseOAuthService[];
};

export type TypeAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<TypeOptions>, 'useFactory' | 'inject'>;
