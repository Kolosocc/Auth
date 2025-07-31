import { DynamicModule, Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import {
  ProviderOptionsSymbol,
  TypeAsyncOptions,
  TypeOptions,
} from './provider.constants';
@Module({
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule {
  public static register(options: TypeOptions): DynamicModule {
    return {
      module: ProviderModule,
      providers: [
        {
          provide: ProviderOptionsSymbol,
          useValue: options, // Передаём полный объект TypeOptions
        },
        ProviderService,
      ],
      exports: [ProviderService],
    };
  }

  public static registerAsync(options: TypeAsyncOptions): DynamicModule {
    return {
      module: ProviderModule,
      imports: options.imports,
      providers: [
        {
          provide: ProviderOptionsSymbol,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    };
  }
}
