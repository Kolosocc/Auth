import {
  type ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(passwordRepeat: string, args: ValidationArguments) {
    const dto = args.object as any;
    const password = dto.password;
    return password === passwordRepeat;
  }

  public defaultMessage(args: ValidationArguments) {
    return 'Passwords do not match';
  }
}
