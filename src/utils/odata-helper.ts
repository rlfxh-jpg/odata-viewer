// utils/odata-helper.ts
export const processAnnotations = (annotations: any[] = []) => {
  const result = {
    displayName: '',
    description: '',
    isSystem: false,
    isReadOnly: false,
    isKey: false
  };

  if (!annotations || !Array.isArray(annotations)) return result;

  annotations.forEach(anno => {
    switch (anno.term) {
      case 'PaaS.DisplayName':
        result.displayName = anno.string?.[0]?.text || '';
        break;
      case 'PaaS.Description':
        result.description = anno.string?.[0]?.text || '';
        break;
      case 'PaaS.SystemPropertyOptional':
        result.isSystem = anno.bool?.[0]?.text === 'true';
        break;
      case 'BuiltInModel.ReadOnly':
        result.isReadOnly = anno.bool?.[0]?.text === 'true';
        break;
    }
  });

  return result;
};