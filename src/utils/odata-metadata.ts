import { XMLParser } from 'fast-xml-parser'
import type {
  ODataAction,
  ODataActionImport,
  AnnotationInfo,
  ODataAnnotationItem,
  ODataComplexType,
  ODataEntitySet,
  ODataEntityType,
  ODataEnumType,
  ODataFunction,
  ODataFunctionImport,
  ODataInheritanceIndex,
  ODataMetadataModel,
  ODataNamespaceModel,
  ODataNavigationProperty,
  ODataOperationParameter,
  ODataProperty,
  ODataRelationCardinality,
  ODataRelationEdge,
  ODataRelationEvidence,
  ODataRelationGraph,
  ODataTerm,
  SchemaTreeNode,
  TypeRef,
} from './odata-types'

type AnyRecord = Record<string, unknown>
type FacetMap = Record<string, string>

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

const makePairKey = (left: string, right: string): string =>
  left < right ? `${left}|${right}` : `${right}|${left}`

const collectAnnotationNodes = (node: AnyRecord): AnyRecord[] => {
  const directNodes = asArray(node.Annotation).map(asRecord)
  const groupedNodes = asArray(node.Annotations).flatMap((group) =>
    asArray(asRecord(group).Annotation).map(asRecord),
  )
  return [...directNodes, ...groupedNodes]
}

const readAnnotationValue = (annotation: AnyRecord): string => {
  const direct =
    pickString(annotation.String) ||
    pickString(annotation.Bool) ||
    pickString(annotation.Int) ||
    pickString(annotation.Decimal) ||
    pickString(annotation.EnumMember) ||
    pickString(annotation.Path) ||
    pickString(annotation.StringValue) ||
    pickString(annotation.stringValue)
  if (direct) {
    return direct
  }

  if (annotation.Record != null) {
    return '[Record]'
  }
  if (annotation.Collection != null) {
    return '[Collection]'
  }
  return ''
}

const readConfigAttributes = (node: AnyRecord): FacetMap => {
  const excluded = new Set(['Name', 'Type', 'Annotation', 'Annotations'])
  const config: FacetMap = {}

  for (const [key, value] of Object.entries(node)) {
    if (excluded.has(key)) {
      continue
    }
    if (typeof value !== 'string') {
      continue
    }
    config[key] = value
  }

  return config
}

const readAnnotationInfo = (node: AnyRecord): AnnotationInfo => {
  const annotations = collectAnnotationNodes(node)
  const annotationItems: ODataAnnotationItem[] = annotations
    .map((annotation) => ({
      term: pickString(annotation.Term),
      qualifier: pickString(annotation.Qualifier) || undefined,
      value: readAnnotationValue(annotation),
    }))
    .filter((item) => Boolean(item.term))

  const readByTerms = (terms: string[]): string => {
    for (const annotation of annotationItems) {
      const term = annotation.term
      if (!terms.includes(term)) {
        continue
      }
      if (annotation.value) {
        return annotation.value
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
    annotations: annotationItems,
  }
}

const parseProperty = (propertyNode: AnyRecord): ODataProperty => {
  const typeRef = parseTypeRef(pickString(propertyNode.Type))
  const annotations = readAnnotationInfo(propertyNode)
  const config = readConfigAttributes(propertyNode)
  return {
    name: pickString(propertyNode.Name),
    type: typeRef,
    nullable: pickString(propertyNode.Nullable) !== 'false',
    maxLength: config.MaxLength,
    precision: config.Precision,
    scale: config.Scale,
    defaultValue: config.DefaultValue,
    config,
    ...annotations,
  }
}

const parseNavigationProperty = (node: AnyRecord): ODataNavigationProperty => {
  const typeRef = parseTypeRef(pickString(node.Type))
  const annotations = readAnnotationInfo(node)
  const partner = pickString(node.Partner) || undefined
  const onDeleteNode = asRecord(node.OnDelete)
  const onDelete = pickString(onDeleteNode.Action) || undefined
  const config = readConfigAttributes(node)

  return {
    name: pickString(node.Name),
    type: typeRef,
    nullable: pickString(node.Nullable) !== 'false',
    partner,
    onDelete,
    config,
    ...annotations,
  }
}

const parseOperationParameter = (parameterNode: AnyRecord): ODataOperationParameter => {
  const typeRef = parseTypeRef(pickString(parameterNode.Type))
  const annotations = readAnnotationInfo(parameterNode)
  const config = readConfigAttributes(parameterNode)
  return {
    name: pickString(parameterNode.Name),
    type: typeRef,
    nullable: pickString(parameterNode.Nullable) !== 'false',
    config,
    ...annotations,
  }
}

const buildOperationSignature = (fullName: string, parameters: ODataOperationParameter[]): string => {
  const signatureArgs = parameters.map((item) => item.type.raw || item.type.fullName).join(', ')
  return `${fullName}(${signatureArgs})`
}

const parseAppliesTo = (rawAppliesTo: string): string[] | undefined => {
  const appliesTo = rawAppliesTo
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return appliesTo.length ? appliesTo : undefined
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

const appendEntitySetToMap = (targetMap: Record<string, ODataEntitySet>, entitySet: ODataEntitySet) => {
  targetMap[entitySet.fullName] = entitySet
  if (!targetMap[entitySet.name]) {
    targetMap[entitySet.name] = entitySet
  }
}

const ensureNamespaceModel = (
  namespaceMap: Record<string, ODataNamespaceModel>,
  namespaces: ODataNamespaceModel[],
  namespace: string,
): ODataNamespaceModel => {
  if (!namespaceMap[namespace]) {
    namespaceMap[namespace] = {
      namespace,
      entitySets: [],
      entityTypes: [],
      complexTypes: [],
      enumTypes: [],
      terms: [],
      actions: [],
      functions: [],
      actionImports: [],
      functionImports: [],
    }
    namespaces.push(namespaceMap[namespace])
  }
  return namespaceMap[namespace]
}

const parseNavigationBindings = (entitySetNode: AnyRecord): Record<string, string> | undefined => {
  const bindings: Record<string, string> = {}
  for (const rawBinding of asArray(entitySetNode.NavigationPropertyBinding).map(asRecord)) {
    const path = pickString(rawBinding.Path).trim()
    const target = pickString(rawBinding.Target).trim()
    if (!path || !target) {
      continue
    }
    bindings[path] = target
  }

  return Object.keys(bindings).length ? bindings : undefined
}

const createCategoryNode = (
  namespace: string,
  keyPart: string,
  labelPrefix: string,
  children: SchemaTreeNode[],
): SchemaTreeNode | null => {
  if (children.length === 0) {
    return null
  }
  return {
    key: `category:${namespace}:${keyPart}`,
    label: labelPrefix,
    kind: 'category',
    children,
  }
}

const createEntityContainerNode = (namespace: string, namespaceModel: ODataNamespaceModel): SchemaTreeNode | null => {
  const containerChildren = [
    createCategoryNode(
      namespace,
      'actionImports',
      'ActionImport',
      namespaceModel.actionImports.map((item) => ({
        key: `actionImport:${item.fullName}`,
        label: item.name,
        kind: 'actionImport' as const,
        payload: item,
      })),
    ),
    createCategoryNode(
      namespace,
      'entitySets',
      'EntitySet',
      namespaceModel.entitySets.map((item) => ({
        key: `entitySet:${item.fullName}`,
        label: item.name,
        kind: 'entitySet' as const,
        payload: item,
      })),
    ),
    createCategoryNode(
      namespace,
      'functionImports',
      'FunctionImport',
      namespaceModel.functionImports.map((item) => ({
        key: `functionImport:${item.fullName}`,
        label: item.name,
        kind: 'functionImport' as const,
        payload: item,
      })),
    ),
  ].filter((item): item is SchemaTreeNode => Boolean(item))

  if (!containerChildren.length) {
    return null
  }

  return {
    key: `category:${namespace}:entityContainer`,
    label: 'EntityContainer',
    kind: 'category',
    children: containerChildren,
  }
}

const buildTree = (namespaces: ODataNamespaceModel[]): SchemaTreeNode[] => {
  return namespaces
    .map((namespaceModel) => {
      const namespace = namespaceModel.namespace
      const categories = [
        createEntityContainerNode(namespace, namespaceModel),
        createCategoryNode(
          namespace,
          'entityTypes',
          'EntityType',
          namespaceModel.entityTypes.map((item) => ({
            key: `entityType:${item.fullName}`,
            label: item.name,
            kind: 'entityType' as const,
            payload: item,
          })),
        ),
        createCategoryNode(
          namespace,
          'complexTypes',
          'ComplexType',
          namespaceModel.complexTypes.map((item) => ({
            key: `complexType:${item.fullName}`,
            label: item.name,
            kind: 'complexType' as const,
            payload: item,
          })),
        ),
        createCategoryNode(
          namespace,
          'enumTypes',
          'EnumType',
          namespaceModel.enumTypes.map((item) => ({
            key: `enumType:${item.fullName}`,
            label: item.name,
            kind: 'enumType' as const,
            payload: item,
          })),
        ),
        createCategoryNode(
          namespace,
          'terms',
          'Term',
          namespaceModel.terms.map((item) => ({
            key: `term:${item.fullName}`,
            label: item.name,
            kind: 'term' as const,
            payload: item,
          })),
        ),
        createCategoryNode(
          namespace,
          'actions',
          'Action',
          namespaceModel.actions.map((item) => ({
            key: `action:${item.signature}`,
            label: item.name,
            kind: 'action' as const,
            payload: item,
          })),
        ),
        createCategoryNode(
          namespace,
          'functions',
          'Function',
          namespaceModel.functions.map((item) => ({
            key: `function:${item.signature}`,
            label: item.name,
            kind: 'function' as const,
            payload: item,
          })),
        ),
      ].filter((item): item is SchemaTreeNode => Boolean(item))

      return {
        key: `namespace:${namespace}`,
        label: namespace,
        kind: 'namespace' as const,
        children: categories,
      }
    })
    .filter((namespaceNode) => (namespaceNode.children?.length ?? 0) > 0)
}

const buildInheritanceIndex = (
  entityTypes: ODataEntityType[],
  complexTypes: ODataComplexType[],
): ODataInheritanceIndex => {
  const parentOf: Record<string, string> = {}
  const childrenOf: Record<string, string[]> = {}
  const rootsByKind: ODataInheritanceIndex['rootsByKind'] = {
    entityType: [],
    complexType: [],
  }

  const collect = <T extends { fullName: string; baseType?: string; baseTypeFullName?: string }>(
    items: T[],
    kind: keyof ODataInheritanceIndex['rootsByKind'],
  ) => {
    for (const item of items) {
      const parent = item.baseTypeFullName || item.baseType
      if (!parent) {
        rootsByKind[kind].push(item.fullName)
        continue
      }

      parentOf[item.fullName] = parent
      if (!childrenOf[parent]) {
        childrenOf[parent] = []
      }
      childrenOf[parent].push(item.fullName)
    }
  }

  collect(entityTypes, 'entityType')
  collect(complexTypes, 'complexType')

  for (const key of Object.keys(childrenOf)) {
    childrenOf[key].sort((left, right) => left.localeCompare(right))
  }
  rootsByKind.entityType.sort((left, right) => left.localeCompare(right))
  rootsByKind.complexType.sort((left, right) => left.localeCompare(right))

  return {
    parentOf,
    childrenOf,
    rootsByKind,
  }
}

const resolveCardinalityByNavigation = (
  sourceNavigation: ODataNavigationProperty,
  reverseNavigation?: ODataNavigationProperty,
): ODataRelationCardinality => {
  const sourceMany = sourceNavigation.type.isCollection
  const targetMany = reverseNavigation?.type.isCollection ?? false

  if (sourceMany && targetMany) {
    return 'N:N'
  }
  if (sourceMany || targetMany) {
    return '1:N'
  }
  return '1:1'
}

interface EntitySetLookup {
  byEntityTypeFullName: Record<string, ODataEntitySet[]>
  byEntityTypeShortName: Record<string, ODataEntitySet[]>
}

const buildEntitySetLookup = (entitySets: ODataEntitySet[]): EntitySetLookup => {
  const byEntityTypeFullName: Record<string, ODataEntitySet[]> = {}
  const byEntityTypeShortName: Record<string, ODataEntitySet[]> = {}

  for (const entitySet of entitySets) {
    if (!byEntityTypeFullName[entitySet.entityTypeFullName]) {
      byEntityTypeFullName[entitySet.entityTypeFullName] = []
    }
    byEntityTypeFullName[entitySet.entityTypeFullName].push(entitySet)

    if (!byEntityTypeShortName[entitySet.entityTypeName]) {
      byEntityTypeShortName[entitySet.entityTypeName] = []
    }
    byEntityTypeShortName[entitySet.entityTypeName].push(entitySet)
  }

  return {
    byEntityTypeFullName,
    byEntityTypeShortName,
  }
}

const resolveEntitySetByTypeRef = (
  typeRef: TypeRef,
  lookup: EntitySetLookup,
): ODataEntitySet | null => {
  const fullMatched = lookup.byEntityTypeFullName[typeRef.fullName]
  if (fullMatched?.length) {
    return fullMatched[0]
  }

  const shortMatched = lookup.byEntityTypeShortName[typeRef.shortName]
  if (shortMatched?.length) {
    return shortMatched[0]
  }

  return null
}

const resolveEntityTypeByEntitySet = (
  entitySet: ODataEntitySet,
  entityTypeMap: Record<string, ODataEntityType>,
): ODataEntityType | null => {
  return entityTypeMap[entitySet.entityTypeFullName] || entityTypeMap[entitySet.entityTypeName] || null
}

const findReverseNavigation = (
  sourceEntityType: ODataEntityType,
  targetEntityType: ODataEntityType,
  sourceNavigation: ODataNavigationProperty,
): ODataNavigationProperty | undefined => {
  if (sourceNavigation.partner) {
    const partnerMatched = targetEntityType.navigationProperties.find(
      (item) => item.name === sourceNavigation.partner,
    )
    if (partnerMatched) {
      return partnerMatched
    }
  }

  return targetEntityType.navigationProperties.find(
    (item) =>
      item.type.fullName === sourceEntityType.fullName ||
      item.type.shortName === sourceEntityType.name ||
      item.type.fullName === sourceEntityType.name,
  )
}

interface MutableRelationEdge {
  key: string
  sourceEntitySet: ODataEntitySet
  targetEntitySet: ODataEntitySet
  evidences: ODataRelationEvidence[]
}

const addRelationEvidence = (
  targetMap: Record<string, MutableRelationEdge>,
  sourceEntitySet: ODataEntitySet,
  targetEntitySet: ODataEntitySet,
  evidence: ODataRelationEvidence,
) => {
  if (sourceEntitySet.fullName === targetEntitySet.fullName) {
    return
  }

  const key = makePairKey(sourceEntitySet.fullName, targetEntitySet.fullName)
  const orderedSets =
    sourceEntitySet.fullName < targetEntitySet.fullName
      ? [sourceEntitySet, targetEntitySet]
      : [targetEntitySet, sourceEntitySet]

  if (!targetMap[key]) {
    targetMap[key] = {
      key,
      sourceEntitySet: orderedSets[0],
      targetEntitySet: orderedSets[1],
      evidences: [],
    }
  }

  targetMap[key].evidences.push(evidence)
}

const mergeCardinality = (evidences: ODataRelationEvidence[]): ODataRelationCardinality => {
  if (evidences.some((item) => item.cardinality === 'N:N')) {
    return 'N:N'
  }
  if (evidences.some((item) => item.cardinality === '1:N')) {
    return '1:N'
  }
  return '1:1'
}

const isRelationEntityType = (entityType: ODataEntityType): boolean => {
  const baseText = `${entityType.baseTypeFullName ?? ''} ${entityType.baseType ?? ''}`.toLowerCase()
  return /^rel/i.test(entityType.name) || baseText.includes('relation')
}

const buildRelationGraph = (
  entitySets: ODataEntitySet[],
  entityTypeMap: Record<string, ODataEntityType>,
): ODataRelationGraph => {
  const lookup = buildEntitySetLookup(entitySets)
  const mutableEdgeMap: Record<string, MutableRelationEdge> = {}

  for (const sourceEntitySet of entitySets) {
    const sourceEntityType = resolveEntityTypeByEntitySet(sourceEntitySet, entityTypeMap)
    if (!sourceEntityType) {
      continue
    }

    for (const navigation of sourceEntityType.navigationProperties) {
      const targetEntitySet = resolveEntitySetByTypeRef(navigation.type, lookup)
      if (!targetEntitySet) {
        continue
      }

      const targetEntityType = resolveEntityTypeByEntitySet(targetEntitySet, entityTypeMap)
      const reverseNavigation = targetEntityType
        ? findReverseNavigation(sourceEntityType, targetEntityType, navigation)
        : undefined
      const cardinality = resolveCardinalityByNavigation(navigation, reverseNavigation)

      addRelationEvidence(mutableEdgeMap, sourceEntitySet, targetEntitySet, {
        type: 'navigation',
        cardinality,
        sourceEntityType: sourceEntityType.fullName,
        targetEntityType: targetEntityType?.fullName ?? navigation.type.fullName,
        sourceNavigationName: navigation.name,
        reverseNavigationName: reverseNavigation?.name,
      })
    }
  }

  const entityTypes = Object.values(entityTypeMap).filter(
    (item, index, arr) => arr.findIndex((current) => current.fullName === item.fullName) === index,
  )

  for (const relationEntityType of entityTypes) {
    if (!isRelationEntityType(relationEntityType)) {
      continue
    }

    const fromNavigation = relationEntityType.navigationProperties.find(
      (item) => item.name.toLowerCase() === 'from',
    )
    const toNavigation = relationEntityType.navigationProperties.find(
      (item) => item.name.toLowerCase() === 'to',
    )

    if (!fromNavigation || !toNavigation) {
      continue
    }

    const fromEntitySet = resolveEntitySetByTypeRef(fromNavigation.type, lookup)
    const toEntitySet = resolveEntitySetByTypeRef(toNavigation.type, lookup)

    if (!fromEntitySet || !toEntitySet) {
      continue
    }

    addRelationEvidence(mutableEdgeMap, fromEntitySet, toEntitySet, {
      type: 'relationEntity',
      cardinality: 'N:N',
      sourceEntityType: fromNavigation.type.fullName || fromNavigation.type.shortName,
      targetEntityType: toNavigation.type.fullName || toNavigation.type.shortName,
      relationEntityName: relationEntityType.name,
    })
  }

  const edgeMap: Record<string, ODataRelationEdge> = {}

  for (const item of Object.values(mutableEdgeMap)) {
    edgeMap[item.key] = {
      key: item.key,
      sourceEntitySetFullName: item.sourceEntitySet.fullName,
      sourceEntitySetName: item.sourceEntitySet.name,
      targetEntitySetFullName: item.targetEntitySet.fullName,
      targetEntitySetName: item.targetEntitySet.name,
      cardinality: mergeCardinality(item.evidences),
      evidences: item.evidences,
    }
  }

  const edges = Object.values(edgeMap).sort((left, right) => left.key.localeCompare(right.key))

  return {
    edges,
    edgeMap,
  }
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

  const namespaces: ODataNamespaceModel[] = []
  const namespaceMap: Record<string, ODataNamespaceModel> = {}

  const entityTypes: ODataEntityType[] = []
  const complexTypes: ODataComplexType[] = []
  const enumTypes: ODataEnumType[] = []
  const terms: ODataTerm[] = []
  const actions: ODataAction[] = []
  const functions: ODataFunction[] = []
  const actionImports: ODataActionImport[] = []
  const functionImports: ODataFunctionImport[] = []
  const entitySets: ODataEntitySet[] = []

  const entityTypeMap: Record<string, ODataEntityType> = {}
  const complexTypeMap: Record<string, ODataComplexType> = {}
  const enumTypeMap: Record<string, ODataEnumType> = {}
  const termMap: Record<string, ODataTerm> = {}
  const actionMap: Record<string, ODataAction> = {}
  const functionMap: Record<string, ODataFunction> = {}
  const actionImportMap: Record<string, ODataActionImport> = {}
  const functionImportMap: Record<string, ODataFunctionImport> = {}
  const entitySetMap: Record<string, ODataEntitySet> = {}
  const rawNodeMap: Record<string, unknown> = {}

  for (const schema of schemas) {
    const namespace = pickString(schema.Namespace) || 'Default'
    const namespaceModel = ensureNamespaceModel(namespaceMap, namespaces, namespace)

    for (const rawEntityType of asArray(schema.EntityType).map(asRecord)) {
      const name = pickString(rawEntityType.Name)
      if (!name) {
        continue
      }

      const keyNames = asArray(asRecord(rawEntityType.Key).PropertyRef)
        .map((node) => pickString(asRecord(node).Name))
        .filter(Boolean)

      const baseTypeRaw = pickString(rawEntityType.BaseType)
      const baseType = baseTypeRaw ? parseTypeRef(baseTypeRaw) : undefined
      const annotations = readAnnotationInfo(rawEntityType)
      const config = readConfigAttributes(rawEntityType)
      const fullName = `${namespace}.${name}`

      const entityType: ODataEntityType = {
        kind: 'entityType',
        namespace,
        name,
        fullName,
        abstract: pickString(rawEntityType.Abstract) === 'true',
        baseType: baseType?.shortName,
        baseTypeFullName: baseType?.fullName,
        keyNames,
        properties: asArray(rawEntityType.Property).map((node) => parseProperty(asRecord(node))),
        navigationProperties: asArray(rawEntityType.NavigationProperty).map((node) =>
          parseNavigationProperty(asRecord(node)),
        ),
        config,
        ...annotations,
      }

      entityTypes.push(entityType)
      namespaceModel.entityTypes.push(entityType)
      appendTypeToMap(entityTypeMap, entityType)
      rawNodeMap[`entityType:${entityType.fullName}`] = rawEntityType
    }

    for (const rawComplexType of asArray(schema.ComplexType).map(asRecord)) {
      const name = pickString(rawComplexType.Name)
      if (!name) {
        continue
      }

      const baseTypeRaw = pickString(rawComplexType.BaseType)
      const baseType = baseTypeRaw ? parseTypeRef(baseTypeRaw) : undefined
      const annotations = readAnnotationInfo(rawComplexType)
      const config = readConfigAttributes(rawComplexType)
      const fullName = `${namespace}.${name}`

      const complexType: ODataComplexType = {
        kind: 'complexType',
        namespace,
        name,
        fullName,
        abstract: pickString(rawComplexType.Abstract) === 'true',
        baseType: baseType?.shortName,
        baseTypeFullName: baseType?.fullName,
        properties: asArray(rawComplexType.Property).map((node) => parseProperty(asRecord(node))),
        config,
        ...annotations,
      }

      complexTypes.push(complexType)
      namespaceModel.complexTypes.push(complexType)
      appendTypeToMap(complexTypeMap, complexType)
      rawNodeMap[`complexType:${complexType.fullName}`] = rawComplexType
    }

    for (const rawEnumType of asArray(schema.EnumType).map(asRecord)) {
      const name = pickString(rawEnumType.Name)
      if (!name) {
        continue
      }

      const annotations = readAnnotationInfo(rawEnumType)
      const config = readConfigAttributes(rawEnumType)
      const fullName = `${namespace}.${name}`

      const enumType: ODataEnumType = {
        kind: 'enumType',
        namespace,
        name,
        fullName,
        underlyingType: pickString(rawEnumType.UnderlyingType) || undefined,
        isFlags: pickString(rawEnumType.IsFlags) === 'true',
        config,
        members: asArray(rawEnumType.Member).map((memberNode) => {
          const member = asRecord(memberNode)
          const memberAnnotations = readAnnotationInfo(member)
          return {
            name: pickString(member.Name),
            value: pickString(member.Value) || undefined,
            displayName: memberAnnotations.displayName || undefined,
            description: memberAnnotations.description || undefined,
          }
        }),
        ...annotations,
      }

      enumTypes.push(enumType)
      namespaceModel.enumTypes.push(enumType)
      appendTypeToMap(enumTypeMap, enumType)
      rawNodeMap[`enumType:${enumType.fullName}`] = rawEnumType
    }

    for (const rawTerm of asArray(schema.Term).map(asRecord)) {
      const name = pickString(rawTerm.Name)
      if (!name) {
        continue
      }

      const type = parseTypeRef(pickString(rawTerm.Type))
      const baseTermRaw = pickString(rawTerm.BaseTerm)
      const baseTerm = baseTermRaw ? parseTypeRef(baseTermRaw) : undefined
      const annotations = readAnnotationInfo(rawTerm)
      const config = readConfigAttributes(rawTerm)
      const fullName = `${namespace}.${name}`

      const term: ODataTerm = {
        kind: 'term',
        namespace,
        name,
        fullName,
        type,
        baseTerm: baseTerm?.shortName,
        baseTermFullName: baseTerm?.fullName,
        appliesTo: parseAppliesTo(pickString(rawTerm.AppliesTo)),
        defaultValue: pickString(rawTerm.DefaultValue) || undefined,
        nullable: pickString(rawTerm.Nullable) !== 'false',
        config,
        ...annotations,
      }

      terms.push(term)
      namespaceModel.terms.push(term)
      appendTypeToMap(termMap, term)
      rawNodeMap[`term:${term.fullName}`] = rawTerm
    }

    for (const rawAction of asArray(schema.Action).map(asRecord)) {
      const name = pickString(rawAction.Name)
      if (!name) {
        continue
      }

      const parameters = asArray(rawAction.Parameter).map((node) => parseOperationParameter(asRecord(node)))
      const returnTypeNode = asRecord(rawAction.ReturnType)
      const returnTypeRaw = pickString(returnTypeNode.Type)
      const returnType = returnTypeRaw ? parseTypeRef(returnTypeRaw) : undefined
      const annotations = readAnnotationInfo(rawAction)
      const config = readConfigAttributes(rawAction)
      const fullName = `${namespace}.${name}`
      const signature = buildOperationSignature(fullName, parameters)

      const action: ODataAction = {
        kind: 'action',
        namespace,
        name,
        fullName,
        signature,
        isBound: pickString(rawAction.IsBound) === 'true',
        entitySetPath: pickString(rawAction.EntitySetPath) || undefined,
        parameters,
        returnType,
        returnNullable: returnType ? pickString(returnTypeNode.Nullable) !== 'false' : undefined,
        config,
        ...annotations,
      }

      actions.push(action)
      namespaceModel.actions.push(action)
      actionMap[action.signature] = action
      if (!actionMap[action.fullName]) {
        actionMap[action.fullName] = action
      }
      rawNodeMap[`action:${action.signature}`] = rawAction
    }

    for (const rawFunction of asArray(schema.Function).map(asRecord)) {
      const name = pickString(rawFunction.Name)
      if (!name) {
        continue
      }

      const parameters = asArray(rawFunction.Parameter).map((node) => parseOperationParameter(asRecord(node)))
      const returnTypeNode = asRecord(rawFunction.ReturnType)
      const returnTypeRaw = pickString(returnTypeNode.Type)
      const returnType = returnTypeRaw ? parseTypeRef(returnTypeRaw) : undefined
      const annotations = readAnnotationInfo(rawFunction)
      const config = readConfigAttributes(rawFunction)
      const fullName = `${namespace}.${name}`
      const signature = buildOperationSignature(fullName, parameters)

      const functionItem: ODataFunction = {
        kind: 'function',
        namespace,
        name,
        fullName,
        signature,
        isBound: pickString(rawFunction.IsBound) === 'true',
        isComposable: pickString(rawFunction.IsComposable) === 'true',
        entitySetPath: pickString(rawFunction.EntitySetPath) || undefined,
        parameters,
        returnType,
        returnNullable: returnType ? pickString(returnTypeNode.Nullable) !== 'false' : undefined,
        config,
        ...annotations,
      }

      functions.push(functionItem)
      namespaceModel.functions.push(functionItem)
      functionMap[functionItem.signature] = functionItem
      if (!functionMap[functionItem.fullName]) {
        functionMap[functionItem.fullName] = functionItem
      }
      rawNodeMap[`function:${functionItem.signature}`] = rawFunction
    }

    for (const container of asArray(schema.EntityContainer).map(asRecord)) {
      for (const rawEntitySet of asArray(container.EntitySet).map(asRecord)) {
        const name = pickString(rawEntitySet.Name)
        if (!name) {
          continue
        }

        const parsedEntityType = parseTypeRef(pickString(rawEntitySet.EntityType))
        const annotations = readAnnotationInfo(rawEntitySet)
        const config = readConfigAttributes(rawEntitySet)
        const fullName = `${namespace}.${name}`

        const entitySet: ODataEntitySet = {
          kind: 'entitySet',
          name,
          namespace,
          fullName,
          entityTypeName: parsedEntityType.shortName,
          entityTypeFullName: parsedEntityType.fullName,
          navigationBindings: parseNavigationBindings(rawEntitySet),
          config,
          ...annotations,
        }

        entitySets.push(entitySet)
        namespaceModel.entitySets.push(entitySet)
        appendEntitySetToMap(entitySetMap, entitySet)
        rawNodeMap[`entitySet:${entitySet.fullName}`] = rawEntitySet
      }

      for (const rawActionImport of asArray(container.ActionImport).map(asRecord)) {
        const name = pickString(rawActionImport.Name)
        if (!name) {
          continue
        }

        const annotations = readAnnotationInfo(rawActionImport)
        const config = readConfigAttributes(rawActionImport)
        const fullName = `${namespace}.${name}`

        const actionImport: ODataActionImport = {
          kind: 'actionImport',
          namespace,
          name,
          fullName,
          action: pickString(rawActionImport.Action),
          includeInServiceDocument: pickString(rawActionImport.IncludeInServiceDocument) === 'true',
          entitySet: pickString(rawActionImport.EntitySet) || undefined,
          config,
          ...annotations,
        }

        actionImports.push(actionImport)
        namespaceModel.actionImports.push(actionImport)
        actionImportMap[actionImport.fullName] = actionImport
        if (!actionImportMap[actionImport.name]) {
          actionImportMap[actionImport.name] = actionImport
        }
        rawNodeMap[`actionImport:${actionImport.fullName}`] = rawActionImport
      }

      for (const rawFunctionImport of asArray(container.FunctionImport).map(asRecord)) {
        const name = pickString(rawFunctionImport.Name)
        if (!name) {
          continue
        }

        const annotations = readAnnotationInfo(rawFunctionImport)
        const config = readConfigAttributes(rawFunctionImport)
        const fullName = `${namespace}.${name}`

        const functionImport: ODataFunctionImport = {
          kind: 'functionImport',
          namespace,
          name,
          fullName,
          function: pickString(rawFunctionImport.Function),
          includeInServiceDocument: pickString(rawFunctionImport.IncludeInServiceDocument) === 'true',
          entitySet: pickString(rawFunctionImport.EntitySet) || undefined,
          config,
          ...annotations,
        }

        functionImports.push(functionImport)
        namespaceModel.functionImports.push(functionImport)
        functionImportMap[functionImport.fullName] = functionImport
        if (!functionImportMap[functionImport.name]) {
          functionImportMap[functionImport.name] = functionImport
        }
        rawNodeMap[`functionImport:${functionImport.fullName}`] = rawFunctionImport
      }
    }
  }

  const inheritanceIndex = buildInheritanceIndex(entityTypes, complexTypes)
  const relationGraph = buildRelationGraph(entitySets, entityTypeMap)

  return {
    sourceLabel,
    serviceRoot,
    namespaces,
    namespaceMap,
    entitySets,
    complexTypes,
    enumTypes,
    terms,
    actions,
    functions,
    actionImports,
    functionImports,
    entityTypes,
    entityTypeMap,
    complexTypeMap,
    enumTypeMap,
    termMap,
    actionMap,
    functionMap,
    actionImportMap,
    functionImportMap,
    entitySetMap,
    rawNodeMap,
    inheritanceIndex,
    relationGraph,
    tree: buildTree(namespaces),
  }
}
