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
}

export interface ODataProperty extends AnnotationInfo {
  name: string
  type: TypeRef
  nullable: boolean
}

export interface ODataNavigationProperty extends AnnotationInfo {
  name: string
  type: TypeRef
  nullable: boolean
}

export interface ODataEntityType extends AnnotationInfo {
  kind: 'entityType'
  name: string
  fullName: string
  baseType?: string
  keyNames: string[]
  properties: ODataProperty[]
  navigationProperties: ODataNavigationProperty[]
}

export interface ODataComplexType extends AnnotationInfo {
  kind: 'complexType'
  name: string
  fullName: string
  baseType?: string
  properties: ODataProperty[]
}

export interface ODataEnumMember {
  name: string
  value?: string
}

export interface ODataEnumType extends AnnotationInfo {
  kind: 'enumType'
  name: string
  fullName: string
  members: ODataEnumMember[]
}

export interface ODataEntitySet extends AnnotationInfo {
  kind: 'entitySet'
  name: string
  namespace: string
  fullName: string
  entityTypeName: string
  entityTypeFullName: string
}

export type SchemaNodeKind = 'category' | 'entitySet' | 'complexType' | 'enumType'

export interface SchemaTreeNode {
  key: string
  label: string
  kind: SchemaNodeKind
  payload?: ODataEntitySet | ODataComplexType | ODataEnumType
  children?: SchemaTreeNode[]
}

export interface ODataMetadataModel {
  sourceLabel: string
  serviceRoot?: string
  entitySets: ODataEntitySet[]
  complexTypes: ODataComplexType[]
  enumTypes: ODataEnumType[]
  entityTypes: ODataEntityType[]
  entityTypeMap: Record<string, ODataEntityType>
  complexTypeMap: Record<string, ODataComplexType>
  enumTypeMap: Record<string, ODataEnumType>
  tree: SchemaTreeNode[]
}
