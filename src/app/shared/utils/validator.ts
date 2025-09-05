import { FormGroup } from '@angular/forms';
export const RegExEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const RegExpPassword = /^(?=.*[A-Z])(?=.*[0-9]).+$/;

export function getErrorMessage(myForm: FormGroup, name: string) {
  const control = myForm.controls[name];

  const errorMessages: {
    [key in 'required' | 'email' | 'pattern' | 'minlength' | 'maxlength' | 'min' | 'max']: string;
  } = {
    required: 'Este campo es requerido',
    email: 'Dirección de correo electrónico no válida',
    pattern: 'Dirección de correo electrónico no válida.',
    minlength: `La longitud mínima es {requiredLength} caracteres.`,
    maxlength: `La longitud máxima es {requiredLength} caracteres.`,
    min: 'El valor mínimo permitido es {min}.',
    max: 'El valor máximo permitido es {max}.',
  };

  const error = Object.keys(errorMessages).find((key) => control.hasError(key)) as keyof typeof errorMessages;

  if (error) {
    const errorMessage = errorMessages[error];
    if (errorMessage.includes('{requiredLength}')) {
      const dynamicValue = control.getError(error)['requiredLength'];
      return errorMessage.replace('{requiredLength}', dynamicValue);
    } else if (error === 'min' || error === 'max') {
      const dynamicValue = control.getError(error)[error];
      return errorMessage.replace(`{${error}}`, dynamicValue);
    } else if (error === 'pattern') {
      const pattern = control.getError('pattern').requiredPattern;
      const patternError = Object.keys(errorMessages).find((key) => key === pattern);
      return patternError ? errorMessages[patternError as keyof typeof errorMessages] : errorMessage;
    }
    return errorMessage;
  }
  return '';
}
