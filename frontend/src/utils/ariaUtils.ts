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
