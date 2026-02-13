export interface TypeRef {
  raw: string
  fullName: string
  shortName: string
  isCollection: boolean
  isEdm: boolean
}

export interface AnnotationInfo {
  displayName: string
  description: string
  annotations: ODataAnnotationItem[]
}

export interface ODataAnnotationItem {
  term: string
  qualifier?: string
  value: string
}

export type ODataFacetMap = Record<string, string>

export interface ODataHasFacetConfig {
  config: ODataFacetMap
}

export interface ODataProperty extends AnnotationInfo, ODataHasFacetConfig {
  name: string
  type: TypeRef
  nullable: boolean
  maxLength?: string
  precision?: string
  scale?: string
  defaultValue?: string
}

export interface ODataNavigationProperty extends AnnotationInfo, ODataHasFacetConfig {
  name: string
  type: TypeRef
  nullable: boolean
  partner?: string
  onDelete?: string
}

export interface ODataOperationParameter extends AnnotationInfo, ODataHasFacetConfig {
  name: string
  type: TypeRef
  nullable: boolean
}

export interface ODataAction extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'action'
  namespace: string
  name: string
  fullName: string
  signature: string
  isBound: boolean
  entitySetPath?: string
  parameters: ODataOperationParameter[]
  returnType?: TypeRef
  returnNullable?: boolean
}

export interface ODataFunction extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'function'
  namespace: string
  name: string
  fullName: string
  signature: string
  isBound: boolean
  isComposable?: boolean
  entitySetPath?: string
  parameters: ODataOperationParameter[]
  returnType?: TypeRef
  returnNullable?: boolean
}

export interface ODataActionImport extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'actionImport'
  namespace: string
  name: string
  fullName: string
  action: string
  includeInServiceDocument?: boolean
  entitySet?: string
}

export interface ODataFunctionImport extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'functionImport'
  namespace: string
  name: string
  fullName: string
  function: string
  includeInServiceDocument?: boolean
  entitySet?: string
}

export interface ODataEntityType extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'entityType'
  namespace: string
  name: string
  fullName: string
  abstract?: boolean
  baseType?: string
  baseTypeFullName?: string
  keyNames: string[]
  properties: ODataProperty[]
  navigationProperties: ODataNavigationProperty[]
}

export interface ODataComplexType extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'complexType'
  namespace: string
  name: string
  fullName: string
  abstract?: boolean
  baseType?: string
  baseTypeFullName?: string
  properties: ODataProperty[]
}

export interface ODataEnumMember {
  name: string
  value?: string
  displayName?: string
  description?: string
}

export interface ODataEnumType extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'enumType'
  namespace: string
  name: string
  fullName: string
  underlyingType?: string
  isFlags?: boolean
  members: ODataEnumMember[]
}

export interface ODataEntitySet extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'entitySet'
  name: string
  namespace: string
  fullName: string
  entityTypeName: string
  entityTypeFullName: string
  navigationBindings?: Record<string, string>
}

export interface ODataTerm extends AnnotationInfo, ODataHasFacetConfig {
  kind: 'term'
  namespace: string
  name: string
  fullName: string
  type: TypeRef
  baseTerm?: string
  baseTermFullName?: string
  appliesTo?: string[]
  defaultValue?: string
  nullable: boolean
}

export type SchemaNodeKind =
  | 'namespace'
  | 'category'
  | 'entitySet'
  | 'entityType'
  | 'complexType'
  | 'enumType'
  | 'term'
  | 'action'
  | 'function'
  | 'actionImport'
  | 'functionImport'

export interface SchemaTreeNode {
  key: string
  label: string
  kind: SchemaNodeKind
  payload?:
    | ODataEntitySet
    | ODataEntityType
    | ODataComplexType
    | ODataEnumType
    | ODataTerm
    | ODataAction
    | ODataFunction
    | ODataActionImport
    | ODataFunctionImport
  children?: SchemaTreeNode[]
}

export interface ODataNamespaceModel {
  namespace: string
  entitySets: ODataEntitySet[]
  entityTypes: ODataEntityType[]
  complexTypes: ODataComplexType[]
  enumTypes: ODataEnumType[]
  terms: ODataTerm[]
  actions: ODataAction[]
  functions: ODataFunction[]
  actionImports: ODataActionImport[]
  functionImports: ODataFunctionImport[]
}

export interface ODataInheritanceIndex {
  parentOf: Record<string, string>
  childrenOf: Record<string, string[]>
  rootsByKind: {
    entityType: string[]
    complexType: string[]
  }
}

export type ODataRelationCardinality = '1:1' | '1:N' | 'N:N'

export interface ODataRelationEvidence {
  type: 'navigation' | 'relationEntity'
  cardinality: ODataRelationCardinality
  sourceEntityType: string
  targetEntityType: string
  sourceNavigationName?: string
  reverseNavigationName?: string
  relationEntityName?: string
}

export interface ODataRelationEdge {
  key: string
  sourceEntitySetFullName: string
  sourceEntitySetName: string
  targetEntitySetFullName: string
  targetEntitySetName: string
  cardinality: ODataRelationCardinality
  evidences: ODataRelationEvidence[]
}

export interface ODataRelationGraph {
  edges: ODataRelationEdge[]
  edgeMap: Record<string, ODataRelationEdge>
}

export interface ODataMetadataModel {
  sourceLabel: string
  serviceRoot?: string
  namespaces: ODataNamespaceModel[]
  namespaceMap: Record<string, ODataNamespaceModel>
  entitySets: ODataEntitySet[]
  complexTypes: ODataComplexType[]
  enumTypes: ODataEnumType[]
  terms: ODataTerm[]
  actions: ODataAction[]
  functions: ODataFunction[]
  actionImports: ODataActionImport[]
  functionImports: ODataFunctionImport[]
  entityTypes: ODataEntityType[]
  entityTypeMap: Record<string, ODataEntityType>
  complexTypeMap: Record<string, ODataComplexType>
  enumTypeMap: Record<string, ODataEnumType>
  termMap: Record<string, ODataTerm>
  actionMap: Record<string, ODataAction>
  functionMap: Record<string, ODataFunction>
  actionImportMap: Record<string, ODataActionImport>
  functionImportMap: Record<string, ODataFunctionImport>
  entitySetMap: Record<string, ODataEntitySet>
  rawNodeMap: Record<string, unknown>
  inheritanceIndex: ODataInheritanceIndex
  relationGraph: ODataRelationGraph
  tree: SchemaTreeNode[]
}
