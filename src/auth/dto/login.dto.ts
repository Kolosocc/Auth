import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 255, { message: 'Password must be between 6 and 255 characters' })
  password: string;
}
