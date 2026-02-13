import { XMLParser } from 'fast-xml-parser'
import type {
  AnnotationInfo,
  ODataComplexType,
  ODataEntitySet,
  ODataEntityType,
  ODataEnumType,
  ODataMetadataModel,
  ODataNavigationProperty,
  ODataProperty,
  SchemaTreeNode,
  TypeRef,
} from './odata-types'

type AnyRecord = Record<string, unknown>

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
})

const asArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

const asRecord = (value: unknown): AnyRecord => {
  if (value && typeof value === 'object') {
    return value as AnyRecord
  }
  return {}
}

const pickString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (value == null) {
    return ''
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickString(item)
      if (found) {
        return found
      }
    }
    return ''
  }
  const record = asRecord(value)
  return (
    pickString(record.text) ||
    pickString(record['#text']) ||
    pickString(record.String) ||
    pickString(record.string) ||
    ''
  )
}

const parseTypeRef = (rawType: string): TypeRef => {
  const trimmed = rawType.trim()
  const collectionMatch = /^Collection\((.+)\)$/i.exec(trimmed)
  const fullName = collectionMatch?.[1] ?? trimmed
  return {
    raw: trimmed,
    fullName,
    shortName: fullName.split('.').pop() ?? fullName,
    isCollection: Boolean(collectionMatch),
    isEdm: fullName.startsWith('Edm.'),
  }
}

const collectAnnotationNodes = (node: AnyRecord): AnyRecord[] => {
  const directNodes = asArray(node.Annotation).map(asRecord)
  const groupedNodes = asArray(node.Annotations).flatMap((group) =>
    asArray(asRecord(group).Annotation).map(asRecord),
  )
  return [...directNodes, ...groupedNodes]
}

const readAnnotationInfo = (node: AnyRecord): AnnotationInfo => {
  const annotations = collectAnnotationNodes(node)

  const readByTerms = (terms: string[]): string => {
    for (const annotation of annotations) {
      const term = pickString(annotation.Term)
      if (!terms.includes(term)) {
        continue
      }
      const textFromChildren =
        pickString(annotation.String) ||
        pickString(annotation.string) ||
        pickString(annotation.Path) ||
        pickString(annotation.path)
      if (textFromChildren) {
        return textFromChildren
      }
      const textFromAttributes =
        pickString(annotation.StringValue) || pickString(annotation.stringValue)
      if (textFromAttributes) {
        return textFromAttributes
      }
    }
    return ''
  }

  return {
    displayName: readByTerms([
      'PaaS.DisplayName',
      'Common.Label',
      'Org.OData.Core.V1.Description',
    ]),
    description: readByTerms(['PaaS.Description', 'Core.Description', 'Org.OData.Core.V1.Description']),
  }
}

const parseProperty = (propertyNode: AnyRecord): ODataProperty => {
  const typeRef = parseTypeRef(pickString(propertyNode.Type))
  const annotations = readAnnotationInfo(propertyNode)
  return {
    name: pickString(propertyNode.Name),
    type: typeRef,
    nullable: pickString(propertyNode.Nullable) !== 'false',
    ...annotations,
  }
}

const parseNavigationProperty = (node: AnyRecord): ODataNavigationProperty => {
  const typeRef = parseTypeRef(pickString(node.Type))
  const annotations = readAnnotationInfo(node)
  return {
    name: pickString(node.Name),
    type: typeRef,
    nullable: pickString(node.Nullable) !== 'false',
    ...annotations,
  }
}

const appendTypeToMap = <T extends { name: string; fullName: string }>(
  targetMap: Record<string, T>,
  typeItem: T,
) => {
  targetMap[typeItem.fullName] = typeItem
  if (!targetMap[typeItem.name]) {
    targetMap[typeItem.name] = typeItem
  }
}

const buildTree = (
  entitySets: ODataEntitySet[],
  complexTypes: ODataComplexType[],
  enumTypes: ODataEnumType[],
): SchemaTreeNode[] => {
  const categories: SchemaTreeNode[] = [
    {
      key: 'category:entitySets',
      label: `EntitySets (${entitySets.length})`,
      kind: 'category',
      children: entitySets.map((item) => ({
        key: `entitySet:${item.name}`,
        label: item.name,
        kind: 'entitySet',
        payload: item,
      })),
    },
    {
      key: 'category:complexTypes',
      label: `ComplexTypes (${complexTypes.length})`,
      kind: 'category',
      children: complexTypes.map((item) => ({
        key: `complexType:${item.name}`,
        label: item.name,
        kind: 'complexType',
        payload: item,
      })),
    },
    {
      key: 'category:enumTypes',
      label: `EnumTypes (${enumTypes.length})`,
      kind: 'category',
      children: enumTypes.map((item) => ({
        key: `enumType:${item.name}`,
        label: item.name,
        kind: 'enumType',
        payload: item,
      })),
    },
  ]

  return categories.filter((category) => (category.children?.length ?? 0) > 0)
}

export const extractServiceRoot = (metadataUrl: string): string => {
  const trimmed = metadataUrl.trim()
  if (!trimmed) {
    return ''
  }
  const [withoutQuery] = trimmed.split('?')
  return withoutQuery.replace(/\/\$metadata$/i, '')
}

export const parseODataMetadata = (
  xml: string,
  sourceLabel: string,
  serviceRoot?: string,
): ODataMetadataModel => {
  const parsedRoot = asRecord(parser.parse(xml))
  const edmx = asRecord(parsedRoot.Edmx)
  const dataServices = asRecord(edmx.DataServices)
  const schemas = asArray(dataServices.Schema).map(asRecord)

  const entityTypes: ODataEntityType[] = []
  const complexTypes: ODataComplexType[] = []
  const enumTypes: ODataEnumType[] = []
  const entitySets: ODataEntitySet[] = []

  const entityTypeMap: Record<string, ODataEntityType> = {}
  const complexTypeMap: Record<string, ODataComplexType> = {}
  const enumTypeMap: Record<string, ODataEnumType> = {}

  for (const schema of schemas) {
    const namespace = pickString(schema.Namespace)

    for (const rawEntityType of asArray(schema.EntityType).map(asRecord)) {
      const name = pickString(rawEntityType.Name)
      if (!name) {
        continue
      }
      const keyNames = asArray(asRecord(rawEntityType.Key).PropertyRef)
        .map((node) => pickString(asRecord(node).Name))
        .filter(Boolean)

      const baseTypeRaw = pickString(rawEntityType.BaseType)
      const annotations = readAnnotationInfo(rawEntityType)
      const entityType: ODataEntityType = {
        kind: 'entityType',
        name,
        fullName: namespace ? `${namespace}.${name}` : name,
        baseType: baseTypeRaw ? parseTypeRef(baseTypeRaw).shortName : undefined,
        keyNames,
        properties: asArray(rawEntityType.Property).map((node) => parseProperty(asRecord(node))),
        navigationProperties: asArray(rawEntityType.NavigationProperty).map((node) =>
          parseNavigationProperty(asRecord(node)),
        ),
        ...annotations,
      }
      entityTypes.push(entityType)
      appendTypeToMap(entityTypeMap, entityType)
    }

    for (const rawComplexType of asArray(schema.ComplexType).map(asRecord)) {
      const name = pickString(rawComplexType.Name)
      if (!name) {
        continue
      }
      const baseTypeRaw = pickString(rawComplexType.BaseType)
      const annotations = readAnnotationInfo(rawComplexType)
      const complexType: ODataComplexType = {
        kind: 'complexType',
        name,
        fullName: namespace ? `${namespace}.${name}` : name,
        baseType: baseTypeRaw ? parseTypeRef(baseTypeRaw).shortName : undefined,
        properties: asArray(rawComplexType.Property).map((node) => parseProperty(asRecord(node))),
        ...annotations,
      }
      complexTypes.push(complexType)
      appendTypeToMap(complexTypeMap, complexType)
    }

    for (const rawEnumType of asArray(schema.EnumType).map(asRecord)) {
      const name = pickString(rawEnumType.Name)
      if (!name) {
        continue
      }
      const annotations = readAnnotationInfo(rawEnumType)
      const enumType: ODataEnumType = {
        kind: 'enumType',
        name,
        fullName: namespace ? `${namespace}.${name}` : name,
        members: asArray(rawEnumType.Member).map((memberNode) => {
          const member = asRecord(memberNode)
          return {
            name: pickString(member.Name),
            value: pickString(member.Value) || undefined,
          }
        }),
        ...annotations,
      }
      enumTypes.push(enumType)
      appendTypeToMap(enumTypeMap, enumType)
    }

    for (const container of asArray(schema.EntityContainer).map(asRecord)) {
      for (const rawEntitySet of asArray(container.EntitySet).map(asRecord)) {
        const name = pickString(rawEntitySet.Name)
        if (!name) {
          continue
        }
        const parsedEntityType = parseTypeRef(pickString(rawEntitySet.EntityType))
        const annotations = readAnnotationInfo(rawEntitySet)
        entitySets.push({
          kind: 'entitySet',
          name,
          namespace,
          fullName: namespace ? `${namespace}.${name}` : name,
          entityTypeName: parsedEntityType.shortName,
          entityTypeFullName: parsedEntityType.fullName,
          ...annotations,
        })
      }
    }
  }

  return {
    sourceLabel,
    serviceRoot,
    entitySets,
    complexTypes,
    enumTypes,
    entityTypes,
    entityTypeMap,
    complexTypeMap,
    enumTypeMap,
    tree: buildTree(entitySets, complexTypes, enumTypes),
  }
}
