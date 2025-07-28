import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { IsPasswordsMatchingConstraint } from 'src/libs/common/decorator/is-passwords-matching-constraint';

export class RegisterDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 255, { message: 'Password must be between 6 and 50 characters' })
  password: string;

  @IsString({ message: 'ConfirmPassword must be a string' })
  @IsNotEmpty({ message: 'ConfirmPassword is required' })
  @Length(6, 255, {
    message: 'ConfirmPassword must be between 6 and 50 characters',
  })
  @Validate(IsPasswordsMatchingConstraint, {
    message: 'Passwords do not match',
  })
  passwordRepeat: string;
}
