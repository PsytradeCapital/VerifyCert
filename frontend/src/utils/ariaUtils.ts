let idCounter = 0;

export const generateAriaId = (prefix: string = 'aria'): string => {
  idCounter++;
  return prefix + '-' + idCounter;
};

export const createFieldAriaAttributes = (fieldId: string) => {
  const labelId = generateAriaId(fieldId + '-label');
  const errorId = generateAriaId(fieldId + '-error');
  const helpId = generateAriaId(fieldId + '-help');
  
  return {
    labelId,
    errorId,
    helpId
  };
};

export const createFieldRelationships = (fieldName: string) => {
  const attributes = createFieldAriaAttributes(fieldName);
  
  return {
    ...attributes,
    getInputProps: (hasError: boolean, hasHelp: boolean) => ({
      'aria-labelledby': attributes.labelId,
      'aria-describedby': [
        hasError ? attributes.errorId : null,
        hasHelp ? attributes.helpId : null
      ].filter(Boolean).join(' ') || undefined,
      'aria-invalid': hasError
    })
  };
};

export const ariaLabels = {
  forms: {
    required: 'Required field'
  }
};
