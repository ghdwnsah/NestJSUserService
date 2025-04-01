import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  export function NotInclude(forbiddenWords: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'NotInclude',
        target: object.constructor,
        propertyName,
        constraints: [forbiddenWords],
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const [words] = args.constraints;
            return !words.some((word: string) => value.includes(word));
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property}에 금지된 단어가 포함되어 있습니다.`;
          },
        },
      });
    };
  }