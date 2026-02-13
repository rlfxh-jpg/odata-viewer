import type { ODataComplexType, ODataEntityType, ODataEnumType, ODataMetadataModel, TypeRef } from './odata-types'

export interface TsGeneratorOptions {
  numberAsNumber: boolean
  dateTimeOffsetAsString: boolean
}

const mapEdmTypeToTs = (edmType: string, options: TsGeneratorOptions): string => {
  switch (edmType) {
    case 'Edm.Boolean':
      return 'boolean'
    case 'Edm.Guid':
    case 'Edm.String':
    case 'Edm.Binary':
    case 'Edm.Date':
    case 'Edm.TimeOfDay':
    case 'Edm.Duration':
      return 'string'
    case 'Edm.DateTimeOffset':
      return options.dateTimeOffsetAsString ? 'string' : 'Date'
    case 'Edm.Int16':
    case 'Edm.Int32':
    case 'Edm.Int64':
    case 'Edm.Decimal':
    case 'Edm.Double':
    case 'Edm.Single':
      return options.numberAsNumber ? 'number' : 'string'
    default:
      return 'unknown'
  }
}

const resolveTypeName = (typeRef: TypeRef, model: ODataMetadataModel, options: TsGeneratorOptions): string => {
  if (typeRef.isEdm) {
    return mapEdmTypeToTs(typeRef.fullName, options)
  }
  const namedType =
    model.entityTypeMap[typeRef.fullName] ||
    model.entityTypeMap[typeRef.shortName] ||
    model.complexTypeMap[typeRef.fullName] ||
    model.complexTypeMap[typeRef.shortName] ||
    model.enumTypeMap[typeRef.fullName] ||
    model.enumTypeMap[typeRef.shortName]
  const baseType = namedType ? namedType.name : typeRef.shortName
  return typeRef.isCollection ? `${baseType}[]` : baseType
}

const generatePropertyLines = (
  entityLike: ODataEntityType | ODataComplexType,
  model: ODataMetadataModel,
  options: TsGeneratorOptions,
): string[] => {
  const lines: string[] = []

  for (const property of entityLike.properties) {
    const optionalMark = property.nullable ? '?' : ''
    const propertyType = resolveTypeName(property.type, model, options)
    lines.push(`  ${property.name}${optionalMark}: ${propertyType}`)
  }

  if ('navigationProperties' in entityLike) {
    for (const nav of entityLike.navigationProperties) {
      const optionalMark = nav.nullable ? '?' : ''
      const navType = resolveTypeName(nav.type, model, options)
      lines.push(`  ${nav.name}${optionalMark}: ${navType}`)
    }
  }

  return lines
}

const generateEntityLikeDefinition = (
  entityLike: ODataEntityType | ODataComplexType,
  model: ODataMetadataModel,
  options: TsGeneratorOptions,
): string => {
  const lines = [`export interface ${entityLike.name} {`]
  lines.push(...generatePropertyLines(entityLike, model, options))
  lines.push('}')
  return lines.join('\n')
}

const generateEnumDefinition = (enumType: ODataEnumType): string => {
  const lines = [`export enum ${enumType.name} {`]
  for (const member of enumType.members) {
    if (member.value == null || member.value === '') {
      lines.push(`  ${member.name} = '${member.name}',`)
    } else if (/^-?\\d+(\\.\\d+)?$/.test(member.value)) {
      lines.push(`  ${member.name} = ${member.value},`)
    } else {
      lines.push(`  ${member.name} = '${member.value}',`)
    }
  }
  lines.push('}')
  return lines.join('\n')
}

export const generateTypeScriptDefinition = (
  selectedType: ODataEntityType | ODataComplexType | ODataEnumType | null,
  model: ODataMetadataModel,
  options: TsGeneratorOptions,
): string => {
  if (!selectedType) {
    return '// 请先选择左侧实体'
  }

  if (selectedType.kind === 'entityType' || selectedType.kind === 'complexType') {
    return generateEntityLikeDefinition(selectedType, model, options)
  }

  return generateEnumDefinition(selectedType)
}
