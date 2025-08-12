import { IsNotEmpty, IsString } from 'class-validator';

export class ConfiramtionDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}
