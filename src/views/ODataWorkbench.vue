<template>
  <section class="workbench">
    <el-tabs v-model="pageTab" class="page-tabs">
      <el-tab-pane label="Connect & Import" name="connect">
        <el-card shadow="never" class="connect-card">
      <div class="connect-row">
        <el-input
          v-model="metadataUrl"
          placeholder="请输入 OData Metadata URL，例如 https://host/odata/$metadata"
          @keyup.enter="handleConnectByUrl"
        >
          <template #append>
            <el-button :loading="connecting" type="primary" @click="handleConnectByUrl">Connect</el-button>
          </template>
        </el-input>
        <el-button @click="loadSampleMetadata">Load Sample Metadata</el-button>
      </div>

      <div class="connect-row secondary-row">
        <el-select
          v-model="selectedHistoryUrl"
          placeholder="Recent connections"
          clearable
          class="history-select"
          @change="handlePickHistory"
        >
          <el-option v-for="item in historyUrls" :key="item" :value="item" :label="item" />
        </el-select>

        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".xml,text/xml,application/xml"
          :before-upload="handleBeforeUpload"
          class="upload-box"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽或点击上传 XML 元数据文件</div>
        </el-upload>
      </div>
    </el-card>
      </el-tab-pane>
      <el-tab-pane label="Schema Explorer" name="explorer">

    <div class="workspace" :style="workspaceStyle">
      <el-card class="sidebar-card" shadow="never">
        <template #header>
          <div class="card-title">Schema Explorer</div>
        </template>
        <el-tree
          ref="treeRef"
          node-key="key"
          :data="treeData"
          :current-node-key="selectedNodeKey"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="schema-tree-node">
              <span class="schema-tree-node-label">{{ data.label }}</span>
              <el-tag v-if="isAbstractEntityTypeNode(data)" size="small" type="warning" effect="plain">
                Abstract
              </el-tag>
            </div>
          </template>
        </el-tree>
      </el-card>

      <div
        class="sidebar-resizer"
        :class="{ active: isSidebarResizing }"
        @mousedown.prevent="startSidebarResize"
      />

      <div class="viewer-area">
        <el-card shadow="never" class="viewer-card">
          <template #header>
            <div class="viewer-header">
              <div>
                <div class="card-title">Viewer</div>
                <div class="sub-title">{{ detailSubtitle }}</div>
              </div>
              <div class="header-actions">
                <el-tooltip :content="erButtonTooltip" placement="top">
                  <span>
                    <el-button :disabled="!canOpenErDialog" type="primary" plain @click="openErDialog">ER 图</el-button>
                  </span>
                </el-tooltip>
                <el-button :disabled="!selectedLeafNode" plain @click="openRawDialog">原始 JSON</el-button>
                <el-tooltip :content="inheritanceTooltip" placement="top">
                  <span>
                    <el-button :disabled="!canOpenInheritance" plain @click="openInheritanceDialog">继承关系</el-button>
                  </span>
                </el-tooltip>
              </div>
            </div>
          </template>

          <el-empty v-if="!selectedLeafNode" description="Please select a node from the left tree" />

          <template v-else>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Fields" name="table">
                <el-card v-if="selectedEntityTypeForDetails" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">EntityType Config</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedEntityTypeForDetails.name }}</el-descriptions-item>
                    <el-descriptions-item label="Abstract">
                      {{ selectedEntityTypeForDetails.abstract ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="BaseType">
                      {{ selectedEntityTypeForDetails.baseTypeFullName || selectedEntityTypeForDetails.baseType || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Keys">
                      {{ selectedEntityTypeForDetails.keyNames.join(', ') || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Entity Annotations" :span="2">
                      {{ annotationSummary(selectedEntityTypeForDetails.annotations, 5) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>

                <template v-if="propertyRows.length">
                  <el-table :data="propertyRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="170">
                      <template #default="{ row }">
                        <div class="field-name">
                          <el-tag v-if="isPrimaryKey(row.name)" type="warning" size="small">PK</el-tag>
                          {{ row.name }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="Type" min-width="180">
                      <template #default="{ row }">
                        {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="MaxLength" width="110">
                      <template #default="{ row }">
                        {{ row.maxLength || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
                <enum-type-detail v-else-if="selectedEnumTypeNode" :data="selectedEnumTypeNode" />
                <el-card v-else-if="selectedTermNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Term Config</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedTermNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">{{ formatTypeRef(selectedTermNode.type) }}</el-descriptions-item>
                    <el-descriptions-item label="Nullable">
                      <el-tag :type="selectedTermNode.nullable ? 'success' : 'danger'" size="small">
                        {{ selectedTermNode.nullable ? 'Yes' : 'No' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="DefaultValue">{{ selectedTermNode.defaultValue || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="BaseTerm">
                      {{ selectedTermNode.baseTermFullName || selectedTermNode.baseTerm || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="AppliesTo">
                      <template v-if="selectedTermNode.appliesTo?.length">
                        {{ selectedTermNode.appliesTo.join(', ') }}
                      </template>
                      <template v-else>-</template>
                    </el-descriptions-item>
                    <el-descriptions-item label="Config" :span="2">{{ termConfigSummary || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedTermNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <el-table
                    v-if="selectedTermNode.annotations.length"
                    :data="selectedTermNode.annotations"
                    border
                    stripe
                    class="sub-card"
                  >
                    <el-table-column prop="term" label="Term" min-width="220" />
                    <el-table-column prop="qualifier" label="Qualifier" min-width="140" />
                    <el-table-column prop="value" label="Value" min-width="220" />
                  </el-table>
                </el-card>
                <el-card v-else-if="selectedOperationNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">{{ selectedOperationNode.kind === 'action' ? 'Action Config' : 'Function Config' }}</div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedOperationNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">
                      {{ selectedOperationNode.kind === 'action' ? 'Action' : 'Function' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Signature" :span="2">
                      {{ selectedOperationNode.signature }}
                    </el-descriptions-item>
                    <el-descriptions-item label="IsBound">
                      {{ selectedOperationNode.isBound ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedOperationNode.kind === 'function'" label="IsComposable">
                      {{ selectedOperationNode.isComposable ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="EntitySetPath">
                      {{ selectedOperationNode.entitySetPath || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="ReturnType">
                      {{ selectedOperationNode.returnType ? formatTypeRef(selectedOperationNode.returnType) : '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Return Nullable">
                      <template v-if="selectedOperationNode.returnType">
                        {{ selectedOperationNode.returnNullable ? 'Yes' : 'No' }}
                      </template>
                      <template v-else>-</template>
                    </el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedOperationNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>

                  <el-table v-if="selectedOperationNode.parameters.length" :data="selectedOperationNode.parameters" border stripe class="sub-card">
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Type" min-width="220">
                      <template #default="{ row }">
                        {{ formatTypeRef(row.type) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
                <el-card v-else-if="selectedOperationImportNode" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">
                      {{ selectedOperationImportNode.kind === 'actionImport' ? 'ActionImport Config' : 'FunctionImport Config' }}
                    </div>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="Name">{{ selectedOperationImportNode.name }}</el-descriptions-item>
                    <el-descriptions-item label="Type">
                      {{ selectedOperationImportNode.kind === 'actionImport' ? 'ActionImport' : 'FunctionImport' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Operation" :span="2">
                      <el-link type="primary" @click="jumpToOperationFromImport(selectedOperationImportNode)">
                        {{
                          selectedOperationImportNode.kind === 'actionImport'
                            ? selectedOperationImportNode.action
                            : selectedOperationImportNode.function
                        }}
                      </el-link>
                    </el-descriptions-item>
                    <el-descriptions-item label="EntitySet">
                      {{ selectedOperationImportNode.entitySet || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="IncludeInServiceDocument">
                      {{ selectedOperationImportNode.includeInServiceDocument ? 'Yes' : 'No' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Annotations" :span="2">
                      {{ annotationSummary(selectedOperationImportNode.annotations, 8) || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>
                <el-empty v-else description="No fields available" />

                <el-card v-if="navigationRows.length" shadow="never" class="sub-card">
                  <template #header>
                    <div class="card-title">Navigation Properties</div>
                  </template>
                  <el-table :data="navigationRows" border stripe>
                    <el-table-column prop="name" label="Name" min-width="180" />
                    <el-table-column label="Target Type" min-width="220">
                      <template #default="{ row }">
                        <el-link type="primary" @click="jumpToNavigationTarget(row)">
                          {{ row.type.shortName }}<span v-if="row.type.isCollection">[]</span>
                        </el-link>
                      </template>
                    </el-table-column>
                    <el-table-column prop="cardinality" label="Cardinality" width="120" />
                    <el-table-column label="Nullable" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.nullable ? 'success' : 'danger'" size="small">
                          {{ row.nullable ? 'Yes' : 'No' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="partner" label="Partner" min-width="140" />
                    <el-table-column prop="onDelete" label="OnDelete" min-width="130" />
                    <el-table-column label="Annotations" min-width="250">
                      <template #default="{ row }">
                        <el-tooltip
                          v-if="row.annotations.length"
                          :content="annotationFull(row.annotations)"
                          placement="top"
                          :show-after="200"
                        >
                          <span class="ellipsis-text">{{ annotationSummary(row.annotations) }}</span>
                        </el-tooltip>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>

              </el-tab-pane>

              <el-tab-pane label="TypeScript" name="ts">
                <div class="option-row">
                  <el-checkbox v-model="tsOptions.numberAsNumber">Edm.Int32 / Decimal => number</el-checkbox>
                  <el-checkbox v-model="tsOptions.dateTimeOffsetAsString">Edm.DateTimeOffset => string</el-checkbox>
                  <el-button type="primary" plain @click="copyTsCode">Copy</el-button>
                </div>
                <el-input :model-value="tsCode" type="textarea" :rows="16" readonly />
              </el-tab-pane>

              <el-tab-pane label="Query Tester" name="try">
                <template v-if="selectedEntitySetNode && selectedEntityTypeForTryIt">
                  <el-alert
                    v-if="!activeServiceRoot"
                    title="Current metadata was loaded from a local file. Connect by URL first to infer the service root."
                    type="warning"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />

                  <div class="try-grid">
                    <el-form label-position="top">
                      <el-form-item label="$expand">
                        <el-tree-select
                          v-model="selectedExpands"
                          :data="tryItExpandTreeData"
                          :props="expandTreeProps"
                          multiple
                          show-checkbox
                          check-strictly
                          filterable
                          clearable
                          collapse-tags
                          collapse-tags-tooltip
                          default-expand-all
                          check-on-click-node
                          placeholder="选择导航路径（支持到底层）"
                        />
                      </el-form-item>

                      <el-form-item label="$select">
                        <el-tree-select
                          v-model="selectedFields"
                          :data="tryItSelectTreeData"
                          :props="expandTreeProps"
                          multiple
                          show-checkbox
                          check-strictly
                          filterable
                          clearable
                          collapse-tags
                          collapse-tags-tooltip
                          default-expand-all
                          check-on-click-node
                          placeholder="根据 Expand 类型选择字段"
                        />
                      </el-form-item>

                      <el-form-item label="$filter">
                        <el-autocomplete
                          v-model="filterText"
                          :fetch-suggestions="queryFilterSuggestion"
                          clearable
                          placeholder="例如：startswith(Name,'A') and IsDeleted eq false"
                        />
                      </el-form-item>

                      <el-form-item label="$top">
                        <el-input-number v-model="topValue" :min="1" :max="500" />
                      </el-form-item>
                    </el-form>

                    <div>
                      <el-form label-position="top">
                        <el-form-item label="请求 URL">
                          <el-input :model-value="generatedTryItUrl" type="textarea" :rows="4" readonly />
                        </el-form-item>
                      </el-form>

                      <el-button type="primary" :loading="tryItLoading" @click="runTryIt">Run</el-button>
                    </div>
                  </div>

                  <el-divider />
                  <el-input
                    :model-value="tryItResponse"
                    type="textarea"
                    :rows="12"
                    readonly
                    placeholder="Response JSON will appear here after execution"
                  />
                </template>
                <el-empty v-else description="Try It supports EntitySet nodes only" />
              </el-tab-pane>
              <el-tab-pane label="OData 请求构建器" name="builder">
                <template v-if="selectedEntityTypeForBuilder">
                  <el-alert
                    v-if="!resolvedBuilderServiceRoot"
                    title="Current metadata was loaded from a local file. Please set Service Root manually or connect by URL."
                    type="warning"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />
                  <el-alert
                    v-else-if="!selectedEntitySetForBuilder"
                    title="No EntitySet mapped for this EntityType. Type name is used as default path and can be edited."
                    type="info"
                    :closable="false"
                    show-icon
                    class="alert-space"
                  />

                  <div class="try-grid">
                    <el-form label-position="top">
                      <el-form-item label="Service Root">
                        <el-input
                          v-model="builderServiceRoot"
                          clearable
                          placeholder="例如：https://host/odata"
                        />
                      </el-form-item>

                      <el-form-item label="Resource Path">
                        <el-input
                          v-model="builderResourcePath"
                          placeholder="例如：Products 或 Products('1001')"
                        />
                      </el-form-item>

                      <el-form-item label="$expand">
                        <el-tree-select
                          v-model="builderSelectedExpands"
                          :data="builderExpandTreeData"
                          :props="expandTreeProps"
                          multiple
                          show-checkbox
                          check-strictly
                          filterable
                          clearable
                          collapse-tags
                          collapse-tags-tooltip
                          default-expand-all
                          check-on-click-node
                          placeholder="选择导航路径（支持到底层）"
                        />
                      </el-form-item>

                      <el-form-item label="$select">
                        <el-tree-select
                          v-model="builderSelectedFields"
                          :data="builderSelectTreeData"
                          :props="expandTreeProps"
                          multiple
                          show-checkbox
                          check-strictly
                          filterable
                          clearable
                          collapse-tags
                          collapse-tags-tooltip
                          default-expand-all
                          check-on-click-node
                          placeholder="根据 Expand 类型选择字段"
                        />
                      </el-form-item>

                      <el-form-item label="$filter">
                        <div class="filter-builder-row">
                          <el-select
                            v-model="builderFilterField"
                            filterable
                            clearable
                            placeholder="选择属性"
                          >
                            <el-option
                              v-for="option in builderFilterFieldOptions"
                              :key="option.value"
                              :label="option.label"
                              :value="option.value"
                            />
                          </el-select>
                          <el-select v-model="builderFilterOperator" placeholder="操作符">
                            <el-option
                              v-for="option in builderFilterOperatorOptions"
                              :key="option.value"
                              :label="option.label"
                              :value="option.value"
                            />
                          </el-select>
                          <el-input
                            v-model="builderFilterValue"
                            clearable
                            placeholder="输入值（如 1 或 'A'）"
                          />
                        </div>
                        <div v-if="builderFilterExpression" class="filter-preview">
                          {{ builderFilterExpression }}
                        </div>
                      </el-form-item>

                      <el-form-item label="$orderby">
                        <el-input v-model="builderOrderByText" placeholder="例如：Name desc" />
                      </el-form-item>

                      <div class="builder-inline-options">
                        <el-form-item label="$top">
                          <el-input-number v-model="builderTopValue" :min="1" :max="5000" />
                        </el-form-item>
                        <el-form-item label="$skip">
                          <el-input-number v-model="builderSkipValue" :min="0" :max="100000" />
                        </el-form-item>
                        <el-form-item label="$count">
                          <el-switch v-model="builderCountValue" />
                        </el-form-item>
                      </div>
                    </el-form>

                    <div>
                      <el-form label-position="top">
                        <el-form-item label="请求 URL">
                          <el-input :model-value="generatedBuilderUrl" type="textarea" :rows="6" readonly />
                        </el-form-item>
                      </el-form>

                      <div class="builder-actions">
                        <el-button plain :disabled="!generatedBuilderUrl" @click="copyBuilderUrl">Copy URL</el-button>
                        <el-button
                          type="primary"
                          :loading="builderRequestLoading"
                          :disabled="!generatedBuilderUrl"
                          @click="runBuilderRequest"
                        >
                          Run
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <el-divider />
                  <el-input
                    :model-value="builderResponseText"
                    type="textarea"
                    :rows="12"
                    readonly
                    placeholder="Response JSON will appear here after execution"
                  />
                </template>
                <el-empty v-else description="OData Builder supports only EntitySet / EntityType nodes" />
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-card>

      </div>
    </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="erDialogVisible"
      title="ER Diagram"
      width="92%"
      top="4vh"
      destroy-on-close
      class="er-diagram-dialog"
    >
      <div class="er-diagram-content">
        <div class="diagram-toolbar">
          <el-tag type="info" effect="plain">中心实体：{{ erCenterEntityType?.name || '-' }}</el-tag>
          <el-tag type="success" effect="plain">关系数量：{{ centerRelationEdges.length }}</el-tag>
          <el-tag v-if="diagramOverflowCount > 0" type="warning" effect="plain">仅显示前 {{ DIAGRAM_MAX_NODES - 1 }} 个关联实体，已忽略 {{ diagramOverflowCount }} 个</el-tag>
        </div>

        <div class="diagram-board-scroll">
          <div ref="diagramBoardRef" class="diagram-board">
            <svg :viewBox="`0 0 ${diagramWidth} ${diagramHeight}`" preserveAspectRatio="xMinYMin meet">
            <defs>
              <marker
                id="arrowHead"
                markerWidth="10"
                markerHeight="8"
                refX="9"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L10,4 L0,8 z" fill="#909399" />
              </marker>
            </defs>

            <g v-for="line in diagramLines" :key="line.key">
              <line
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                stroke="#909399"
                stroke-width="1.5"
                marker-end="url(#arrowHead)"
              />
              <text
                :x="(line.x1 + line.x2) / 2"
                :y="(line.y1 + line.y2) / 2 - 4"
                fill="#606266"
                font-size="12"
              >
                {{ line.label }}
              </text>
            </g>
            </svg>

            <div
              v-for="node in diagramNodes"
              :key="node.key"
              class="diagram-node"
              :class="{ center: node.isCenter, dragging: draggingNodeKey === node.key }"
              :style="{ left: `${node.x}px`, top: `${node.y}px` }"
              @mousedown.stop.prevent="startNodeDrag(node, $event)"
              @click="handleDiagramNodeClick(node)"
            >
              <div class="diagram-node-title">{{ node.entityType.name }}</div>
              <div class="diagram-node-type">{{ node.entityType.fullName }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <json-viewer-dialog v-model="rawDialogVisible" :data="selectedRawData" :title="rawDialogTitle" />
    <type-inheritance-tree
      v-model="inheritanceDialogVisible"
      :types="inheritanceTypesForDialog"
      :current-type-name="inheritanceCurrentTypeName"
      :kind="inheritanceKind"
      @select-type="handleInheritanceTypeSelect"
    />
  </section>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import JsonViewerDialog from './components/jsonViewerDialog.vue'
import EnumTypeDetail from './components/enumType.vue'
import TypeInheritanceTree from './components/typeInheritanceTree.vue'
import sampleMetadataXml from '../assets/metadata.xml?raw'
import { extractServiceRoot, parseODataMetadata } from '../utils/odata-metadata'
import type {
  ODataAction,
  ODataActionImport,
  ODataAnnotationItem,
  ODataComplexType,
  ODataEntitySet,
  ODataEntityType,
  ODataEnumType,
  ODataFunction,
  ODataFunctionImport,
  ODataMetadataModel,
  ODataNavigationProperty,
  ODataProperty,
  ODataRelationCardinality,
  ODataTerm,
  SchemaTreeNode,
  TypeRef,
} from '../utils/odata-types'
import { loadHistory, saveHistory } from '../utils/persist'
import type { TsGeneratorOptions } from '../utils/ts-generator'
import { generateTypeScriptDefinition } from '../utils/ts-generator'

const metadataUrl = ref('')
const selectedHistoryUrl = ref('')
const historyUrls = ref<string[]>([])
const connecting = ref(false)
const metadataModel = ref<ODataMetadataModel | null>(null)
const pageTab = ref<'connect' | 'explorer'>('connect')
const selectedNodeKey = ref('')
const activeTab = ref('table')
const treeRef = ref()
const sidebarWidth = ref(300)
const isSidebarResizing = ref(false)

const tsOptions = ref<TsGeneratorOptions>({
  numberAsNumber: true,
  dateTimeOffsetAsString: true,
})

const selectedFields = ref<string[]>([])
const selectedExpands = ref<string[]>([])
const filterText = ref('')
const topValue = ref(20)
const tryItLoading = ref(false)
const tryItResponse = ref('')
const builderServiceRoot = ref('')
const builderResourcePath = ref('')
const builderSelectedFields = ref<string[]>([])
const builderSelectedExpands = ref<string[]>([])
const builderFilterField = ref('')
const builderFilterOperator = ref('eq')
const builderFilterValue = ref('')
const builderOrderByText = ref('')
const builderTopValue = ref(20)
const builderSkipValue = ref(0)
const builderCountValue = ref(false)
const builderRequestLoading = ref(false)
const builderResponseText = ref('')

const rawDialogVisible = ref(false)
const inheritanceDialogVisible = ref(false)
const erDialogVisible = ref(false)
const diagramBoardRef = ref<HTMLElement | null>(null)
const diagramWidth = ref(980)
const diagramHeight = ref(980)
const draggingNodeKey = ref('')
const suppressedClickNodeKey = ref('')
const diagramNodePositionOverrides = ref<Record<string, { x: number; y: number }>>({})

const DIAGRAM_MAX_NODES = 20
const diagramNodeWidth = 190
const diagramNodeHeight = 72
const SIDEBAR_MIN_WIDTH = 240
const SIDEBAR_MAX_WIDTH = 640
const EXPAND_TREE_MAX_DEPTH = 8
const builderFilterOperatorOptions = [
  { label: 'eq (=)', value: 'eq' },
  { label: 'ne (!=)', value: 'ne' },
  { label: 'gt (>)', value: 'gt' },
  { label: 'ge (>=)', value: 'ge' },
  { label: 'lt (<)', value: 'lt' },
  { label: 'le (<=)', value: 'le' },
  { label: 'contains', value: 'contains' },
  { label: 'startswith', value: 'startswith' },
  { label: 'endswith', value: 'endswith' },
] as const

const workspaceStyle = computed(() => ({
  gridTemplateColumns: `${sidebarWidth.value}px 12px minmax(0, 1fr)`,
}))

const treeData = computed(() => metadataModel.value?.tree ?? [])

interface NavigationRow extends ODataNavigationProperty {
  cardinality: ODataRelationCardinality
  targetEntitySet: ODataEntitySet | null
}

interface InheritanceDialogType {
  name: string
  fullName: string
  abstract?: boolean
  baseType?: string
  baseTypeFullName?: string
  kind: 'entityType' | 'complexType'
}

interface ExpandTreeNode {
  label: string
  value: string
  children?: ExpandTreeNode[]
  disabled?: boolean
}

interface FilterFieldOption {
  label: string
  value: string
}

const treeNodeMap = computed(() => {
  const nodeMap: Record<string, SchemaTreeNode> = {}
  const travel = (nodes: SchemaTreeNode[]) => {
    for (const node of nodes) {
      nodeMap[node.key] = node
      if (node.children?.length) {
        travel(node.children)
      }
    }
  }
  travel(treeData.value)
  return nodeMap
})

const selectedNode = computed(() => {
  if (!selectedNodeKey.value) {
    return null
  }
  return treeNodeMap.value[selectedNodeKey.value] ?? null
})

const selectedLeafNode = computed(() => {
  if (!selectedNode.value) {
    return null
  }
  if (selectedNode.value.kind === 'namespace' || selectedNode.value.kind === 'category') {
    return null
  }
  return selectedNode.value
})

const selectedEntitySetNode = computed(() => {
  if (selectedLeafNode.value?.kind !== 'entitySet') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEntitySet
})

const selectedEntityTypeNode = computed<ODataEntityType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'entityType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEntityType
})

const isAbstractEntityTypeNode = (node: SchemaTreeNode) => {
  if (node.kind !== 'entityType') {
    return false
  }
  return Boolean((node.payload as ODataEntityType | undefined)?.abstract)
}

const selectedComplexTypeNode = computed<ODataComplexType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'complexType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataComplexType
})

const selectedEnumTypeNode = computed<ODataEnumType | null>(() => {
  if (selectedLeafNode.value?.kind !== 'enumType') {
    return null
  }
  return selectedLeafNode.value.payload as ODataEnumType
})

const selectedTermNode = computed<ODataTerm | null>(() => {
  if (selectedLeafNode.value?.kind !== 'term') {
    return null
  }
  return selectedLeafNode.value.payload as ODataTerm
})

const selectedActionNode = computed<ODataAction | null>(() => {
  if (selectedLeafNode.value?.kind !== 'action') {
    return null
  }
  return selectedLeafNode.value.payload as ODataAction
})

const selectedFunctionNode = computed<ODataFunction | null>(() => {
  if (selectedLeafNode.value?.kind !== 'function') {
    return null
  }
  return selectedLeafNode.value.payload as ODataFunction
})

const selectedActionImportNode = computed<ODataActionImport | null>(() => {
  if (selectedLeafNode.value?.kind !== 'actionImport') {
    return null
  }
  return selectedLeafNode.value.payload as ODataActionImport
})

const selectedFunctionImportNode = computed<ODataFunctionImport | null>(() => {
  if (selectedLeafNode.value?.kind !== 'functionImport') {
    return null
  }
  return selectedLeafNode.value.payload as ODataFunctionImport
})

const selectedOperationNode = computed<ODataAction | ODataFunction | null>(
  () => selectedActionNode.value ?? selectedFunctionNode.value,
)

const selectedOperationImportNode = computed<ODataActionImport | ODataFunctionImport | null>(
  () => selectedActionImportNode.value ?? selectedFunctionImportNode.value,
)

const erCenterEntityType = computed<ODataEntityType | null>(() => {
  if (selectedEntityTypeNode.value) {
    return selectedEntityTypeNode.value
  }
  if (!selectedEntitySetNode.value || !metadataModel.value) {
    return null
  }
  return (
    metadataModel.value.entityTypeMap[selectedEntitySetNode.value.entityTypeFullName] ??
    metadataModel.value.entityTypeMap[selectedEntitySetNode.value.entityTypeName] ??
    null
  )
})

const canOpenErDialog = computed(() => Boolean(metadataModel.value && erCenterEntityType.value))

const erButtonTooltip = computed(() => {
  if (!metadataModel.value) {
    return 'Please load metadata first'
  }
  if (!selectedLeafNode.value) {
    return 'Please select an EntityType or EntitySet node on the left'
  }
  if (selectedLeafNode.value.kind !== 'entityType' && selectedLeafNode.value.kind !== 'entitySet') {
    return 'ER diagram is available only for EntityType / EntitySet nodes'
  }
  if (!erCenterEntityType.value) {
    return 'Cannot resolve EntityType for current EntitySet'
  }
  return 'Build relationship diagram with current EntityType as center'
})

const resolveEntityTypeByEntitySet = (entitySet: ODataEntitySet): ODataEntityType | null => {
  if (!metadataModel.value) {
    return null
  }
  return (
    metadataModel.value.entityTypeMap[entitySet.entityTypeFullName] ??
    metadataModel.value.entityTypeMap[entitySet.entityTypeName] ??
    null
  )
}

const findEntitySetByTypeRef = (typeRef: TypeRef): ODataEntitySet | null => {
  if (!metadataModel.value) {
    return null
  }

  return (
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeFullName === typeRef.fullName) ??
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeName === typeRef.shortName) ??
    null
  )
}

const findEntityTypeByTypeRef = (typeRef: TypeRef): ODataEntityType | null => {
  if (!metadataModel.value) {
    return null
  }

  return (
    metadataModel.value.entityTypeMap[typeRef.fullName] ??
    metadataModel.value.entityTypeMap[typeRef.shortName] ??
    null
  )
}

const findEntitySetByEntityType = (entityType: ODataEntityType): ODataEntitySet | null => {
  if (!metadataModel.value) {
    return null
  }

  return (
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeFullName === entityType.fullName) ??
    metadataModel.value.entitySets.find((entitySet) => entitySet.entityTypeName === entityType.name) ??
    null
  )
}

const uniqueStringList = (items: string[]): string[] => Array.from(new Set(items))

const expandTreeProps = {
  value: 'value',
  label: 'label',
  children: 'children',
}

const normalizeExpandPaths = (paths: string[]): string[] => {
  const cleaned = uniqueStringList(paths.map((item) => item.trim()).filter(Boolean))
  return cleaned.filter(
    (currentPath) => !cleaned.some((otherPath) => otherPath !== currentPath && otherPath.startsWith(`${currentPath}/`)),
  )
}

const uniqueExpandPaths = (paths: string[]): string[] =>
  uniqueStringList(paths.map((item) => item.trim()).filter(Boolean))

const buildExpandQueryValue = (paths: string[]): string => {
  const cleanedPaths = uniqueExpandPaths(paths)
  if (!cleanedPaths.length) {
    return ''
  }

  interface ExpandQueryNode {
    children: Record<string, ExpandQueryNode>
  }

  const root: Record<string, ExpandQueryNode> = {}

  for (const path of cleanedPaths) {
    const segments = path
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean)
    if (!segments.length) {
      continue
    }

    let current = root
    for (const segment of segments) {
      current[segment] = current[segment] ?? { children: {} }
      current = current[segment].children
    }
  }

  const serializeNode = (name: string, node: ExpandQueryNode): string => {
    const children = Object.keys(node.children)
      .sort((left, right) => left.localeCompare(right))
      .map((childName) => serializeNode(childName, node.children[childName]))
      .join(',')

    if (!children) {
      return name
    }
    return `${name}($expand=${children})`
  }

  return Object.keys(root)
    .sort((left, right) => left.localeCompare(right))
    .map((name) => serializeNode(name, root[name]))
    .join(',')
}

const extractSelectNavigationPaths = (fields: string[]): string[] =>
  uniqueStringList(
    fields
      .map((item) => item.trim())
      .filter((item) => item.includes('/'))
      .map((item) => {
        const parts = item.split('/').filter(Boolean)
        return parts.length > 1 ? parts.slice(0, -1).join('/') : ''
      })
      .filter(Boolean),
  )

const buildExpandTree = (entityType: ODataEntityType | null): ExpandTreeNode[] => {
  if (!entityType) {
    return []
  }

  const buildChildren = (
    currentType: ODataEntityType,
    parentPath: string[],
    visitedTypes: Set<string>,
    depth: number,
  ): ExpandTreeNode[] => {
    if (depth >= EXPAND_TREE_MAX_DEPTH) {
      return []
    }

    const nodes: ExpandTreeNode[] = []
    for (const navigation of currentType.navigationProperties) {
      const currentPath = [...parentPath, navigation.name]
      const value = currentPath.join('/')
      const targetType = findEntityTypeByTypeRef(navigation.type)

      let children: ExpandTreeNode[] = []
      if (targetType && !visitedTypes.has(targetType.fullName)) {
        const nextVisited = new Set(visitedTypes)
        nextVisited.add(targetType.fullName)
        children = buildChildren(targetType, currentPath, nextVisited, depth + 1)
      }

      nodes.push({
        label: targetType ? `${navigation.name} -> ${targetType.name}` : navigation.name,
        value,
        children: children.length ? children : undefined,
      })
    }

    return nodes.sort((left, right) => left.label.localeCompare(right.label))
  }

  return buildChildren(entityType, [], new Set([entityType.fullName]), 0)
}

const resolveEntityTypeByExpandPath = (
  rootEntityType: ODataEntityType | null,
  expandPath: string,
): ODataEntityType | null => {
  if (!rootEntityType) {
    return null
  }

  const segments = expandPath
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
  if (!segments.length) {
    return null
  }

  let currentType: ODataEntityType | null = rootEntityType
  for (const segment of segments) {
    const navigation = currentType.navigationProperties.find((item) => item.name === segment)
    if (!navigation) {
      return null
    }
    currentType = findEntityTypeByTypeRef(navigation.type)
    if (!currentType) {
      return null
    }
  }

  return currentType
}

const buildSelectTree = (entityType: ODataEntityType | null, expandPaths: string[]): ExpandTreeNode[] => {
  if (!entityType) {
    return []
  }

  const nodes: ExpandTreeNode[] = [
    {
      label: `Root (${entityType.name})`,
      value: '__root__',
      disabled: true,
      children: entityType.properties.map((property) => ({
        label: property.name,
        value: property.name,
      })),
    },
  ]

  const uniquePaths = uniqueExpandPaths(expandPaths).sort((left, right) => left.localeCompare(right))
  for (const path of uniquePaths) {
    const targetEntityType = resolveEntityTypeByExpandPath(entityType, path)
    if (!targetEntityType) {
      continue
    }
    nodes.push({
      label: `${path} (${targetEntityType.name})`,
      value: `__expand__:${path}`,
      disabled: true,
      children: targetEntityType.properties.map((property) => ({
        label: property.name,
        value: `${path}/${property.name}`,
      })),
    })
  }

  return nodes
}

const collectLeafSelectValues = (nodes: ExpandTreeNode[]): string[] => {
  const values: string[] = []

  const travel = (items: ExpandTreeNode[]) => {
    for (const item of items) {
      if (item.children?.length) {
        travel(item.children)
        continue
      }
      if (!item.disabled) {
        values.push(item.value)
      }
    }
  }

  travel(nodes)
  return uniqueStringList(values)
}

const buildFilterTemplates = (entityType: ODataEntityType | null): Array<{ value: string }> => {
  if (!entityType) {
    return []
  }

  const templates: string[] = []

  for (const field of entityType.properties) {
    templates.push(`${field.name} eq `)
    templates.push(`${field.name} ne `)
    templates.push(`${field.name} gt `)
    templates.push(`startswith(${field.name}, '')`)
    templates.push(`contains(${field.name}, '')`)
  }

  for (const navigation of entityType.navigationProperties) {
    const targetEntityType = findEntityTypeByTypeRef(navigation.type)
    if (!targetEntityType) {
      continue
    }

    for (const targetProperty of targetEntityType.properties) {
      if (navigation.type.isCollection) {
        templates.push(`${navigation.name}/any(x:x/${targetProperty.name} eq )`)
        templates.push(`${navigation.name}/any(x:contains(x/${targetProperty.name}, ''))`)
      } else {
        const path = `${navigation.name}/${targetProperty.name}`
        templates.push(`${path} eq `)
        templates.push(`${path} ne `)
        templates.push(`${path} gt `)
        templates.push(`startswith(${path}, '')`)
        templates.push(`contains(${path}, '')`)
      }
    }
  }

  return uniqueStringList(templates).map((value) => ({ value }))
}

const selectedEntityTypeForDetails = computed<ODataEntityType | null>(() => {
  if (selectedEntitySetNode.value) {
    return resolveEntityTypeByEntitySet(selectedEntitySetNode.value)
  }
  if (selectedEntityTypeNode.value) {
    return selectedEntityTypeNode.value
  }
  return null
})

const selectedEntitySetForDetails = computed<ODataEntitySet | null>(() => {
  if (selectedEntitySetNode.value) {
    return selectedEntitySetNode.value
  }
  if (!metadataModel.value || !selectedEntityTypeForDetails.value) {
    return null
  }
  return (
    metadataModel.value.entitySets.find(
      (entitySet) =>
        entitySet.entityTypeFullName === selectedEntityTypeForDetails.value?.fullName ||
        entitySet.entityTypeName === selectedEntityTypeForDetails.value?.name,
    ) ?? null
  )
})

const selectedEntityTypeForTryIt = computed<ODataEntityType | null>(() => {
  if (!selectedEntitySetNode.value) {
    return null
  }
  return resolveEntityTypeByEntitySet(selectedEntitySetNode.value)
})

const selectedEntityTypeForBuilder = computed<ODataEntityType | null>(() => selectedEntityTypeForDetails.value)

const selectedEntitySetForBuilder = computed<ODataEntitySet | null>(() => selectedEntitySetForDetails.value)

const tryItExpandTreeData = computed<ExpandTreeNode[]>(() =>
  buildExpandTree(selectedEntityTypeForTryIt.value),
)

const builderExpandTreeData = computed<ExpandTreeNode[]>(() =>
  buildExpandTree(selectedEntityTypeForBuilder.value),
)

const tryItSelectTreeData = computed<ExpandTreeNode[]>(() =>
  buildSelectTree(selectedEntityTypeForTryIt.value, selectedExpands.value),
)

const builderSelectTreeData = computed<ExpandTreeNode[]>(() =>
  buildSelectTree(selectedEntityTypeForBuilder.value, builderSelectedExpands.value),
)

const tryItSelectableLeafValues = computed<string[]>(() => collectLeafSelectValues(tryItSelectTreeData.value))

const builderSelectableLeafValues = computed<string[]>(() => collectLeafSelectValues(builderSelectTreeData.value))

const builderFilterFieldOptions = computed<FilterFieldOption[]>(() =>
  builderSelectableLeafValues.value.map((value) => ({ label: value, value })),
)

const buildFilterLiteral = (input: string): string => {
  const value = input.trim()
  if (!value) {
    return ''
  }
  if (/^'.*'$/.test(value)) {
    return value
  }
  if (/^(true|false|null)$/i.test(value)) {
    return value.toLowerCase()
  }
  if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
    return value
  }
  return `'${value.replace(/'/g, "''")}'`
}

const builderFilterExpression = computed(() => {
  const field = builderFilterField.value.trim()
  const rawValue = builderFilterValue.value.trim()
  if (!field || !rawValue) {
    return ''
  }

  const operator = builderFilterOperator.value
  const literal = buildFilterLiteral(rawValue)
  if (!literal) {
    return ''
  }

  if (operator === 'contains' || operator === 'startswith' || operator === 'endswith') {
    return `${operator}(${field},${literal})`
  }
  return `${field} ${operator} ${literal}`
})

const propertyRows = computed<ODataProperty[]>(() => {
  if (selectedEntityTypeForDetails.value) {
    return selectedEntityTypeForDetails.value.properties
  }
  if (selectedComplexTypeNode.value) {
    return selectedComplexTypeNode.value.properties
  }
  return []
})

const findReverseNavigation = (
  sourceEntityType: ODataEntityType,
  targetEntityType: ODataEntityType,
  sourceNavigation: ODataNavigationProperty,
): ODataNavigationProperty | undefined => {
  if (sourceNavigation.partner) {
    const byPartner = targetEntityType.navigationProperties.find((item) => item.name === sourceNavigation.partner)
    if (byPartner) {
      return byPartner
    }
  }

  return targetEntityType.navigationProperties.find(
    (item) =>
      item.type.fullName === sourceEntityType.fullName ||
      item.type.shortName === sourceEntityType.name ||
      item.type.fullName === sourceEntityType.name,
  )
}

const resolveCardinalityFromNavigation = (
  navigation: ODataNavigationProperty,
  reverseNavigation?: ODataNavigationProperty,
): ODataRelationCardinality => {
  const sourceMany = navigation.type.isCollection
  const targetMany = reverseNavigation?.type.isCollection ?? false

  if (sourceMany && targetMany) {
    return 'N:N'
  }
  if (sourceMany || targetMany) {
    return '1:N'
  }
  return '1:1'
}

const makePairKey = (left: string, right: string): string => (left < right ? `${left}|${right}` : `${right}|${left}`)

const resolveNavigationCardinality = (
  navigation: ODataNavigationProperty,
  targetEntitySet: ODataEntitySet | null,
): ODataRelationCardinality => {
  const sourceEntityType = selectedEntityTypeForDetails.value
  if (!sourceEntityType) {
    return '1:1'
  }

  if (metadataModel.value && selectedEntitySetForDetails.value && targetEntitySet) {
    const graphKey = makePairKey(selectedEntitySetForDetails.value.fullName, targetEntitySet.fullName)
    const graphEdge = metadataModel.value.relationGraph.edgeMap[graphKey]
    if (graphEdge) {
      return graphEdge.cardinality
    }
  }

  const targetEntityType = targetEntitySet
    ? resolveEntityTypeByEntitySet(targetEntitySet)
    : findEntityTypeByTypeRef(navigation.type)

  if (!targetEntityType) {
    return navigation.type.isCollection ? '1:N' : '1:1'
  }

  const reverseNavigation = findReverseNavigation(sourceEntityType, targetEntityType, navigation)
  return resolveCardinalityFromNavigation(navigation, reverseNavigation)
}

const navigationRows = computed<NavigationRow[]>(() => {
  if (!selectedEntityTypeForDetails.value) {
    return []
  }

  return selectedEntityTypeForDetails.value.navigationProperties.map((navigation) => {
    const targetEntitySet = findEntitySetByTypeRef(navigation.type)
    return {
      ...navigation,
      cardinality: resolveNavigationCardinality(navigation, targetEntitySet),
      targetEntitySet,
    }
  })
})

const selectedTypeForCode = computed(
  () => selectedEntityTypeForDetails.value ?? selectedComplexTypeNode.value ?? selectedEnumTypeNode.value,
)

const tsCode = computed(() => {
  if (!metadataModel.value) {
    return '// Please load OData metadata first'
  }
  if (selectedTermNode.value) {
    return '// Term node does not generate TypeScript definition'
  }
  if (selectedOperationNode.value || selectedOperationImportNode.value) {
    return '// Action/Function/Import nodes do not generate TypeScript definition'
  }
  return generateTypeScriptDefinition(selectedTypeForCode.value, metadataModel.value, tsOptions.value)
})

const detailSubtitle = computed(() => {
  if (selectedEntitySetNode.value) {
    return `${selectedEntitySetNode.value.name} (EntitySet -> ${selectedEntityTypeForDetails.value?.name ?? selectedEntitySetNode.value.entityTypeName})`
  }
  if (selectedEntityTypeNode.value) {
    return `${selectedEntityTypeNode.value.name} (EntityType)`
  }
  if (selectedComplexTypeNode.value) {
    return `${selectedComplexTypeNode.value.name} (ComplexType)`
  }
  if (selectedEnumTypeNode.value) {
    return `${selectedEnumTypeNode.value.name} (EnumType)`
  }
  if (selectedTermNode.value) {
    return `${selectedTermNode.value.name} (Term)`
  }
  if (selectedActionNode.value) {
    return `${selectedActionNode.value.name} (Action)`
  }
  if (selectedFunctionNode.value) {
    return `${selectedFunctionNode.value.name} (Function)`
  }
  if (selectedActionImportNode.value) {
    return `${selectedActionImportNode.value.name} (ActionImport)`
  }
  if (selectedFunctionImportNode.value) {
    return `${selectedFunctionImportNode.value.name} (FunctionImport)`
  }
  return 'No node selected'
})

const activeServiceRoot = computed(() => {
  if (metadataModel.value?.serviceRoot) {
    return metadataModel.value.serviceRoot
  }
  return extractServiceRoot(metadataUrl.value)
})

const buildODataQuery = (items: Array<[string, string | undefined]>): string =>
  items
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value as string}`)
    .join('&')

const resolvedBuilderServiceRoot = computed(() => {
  const manual = builderServiceRoot.value.trim()
  if (manual) {
    return manual.replace(/\/$/, '')
  }
  if (activeServiceRoot.value) {
    return activeServiceRoot.value.replace(/\/$/, '')
  }
  return ''
})

const generatedTryItUrl = computed(() => {
  if (!selectedEntitySetNode.value || !activeServiceRoot.value) {
    return ''
  }
  const selectExpandPaths = extractSelectNavigationPaths(selectedFields.value)
  const mergedExpands = normalizeExpandPaths([...selectedExpands.value, ...selectExpandPaths])
  const expandQuery = buildExpandQueryValue(mergedExpands)
  const query = buildODataQuery([
    ['$select', selectedFields.value.length ? selectedFields.value.join(',') : undefined],
    ['$expand', expandQuery || undefined],
    ['$filter', filterText.value.trim() || undefined],
    ['$top', topValue.value > 0 ? String(topValue.value) : undefined],
  ])
  const root = activeServiceRoot.value.replace(/\/$/, '')
  return `${root}/${selectedEntitySetNode.value.name}${query ? `?${query}` : ''}`
})

const generatedBuilderUrl = computed(() => {
  if (!resolvedBuilderServiceRoot.value) {
    return ''
  }
  const resourcePath = builderResourcePath.value.trim()
  if (!resourcePath) {
    return ''
  }

  const selectExpandPaths = extractSelectNavigationPaths(builderSelectedFields.value)
  const mergedExpands = normalizeExpandPaths([...builderSelectedExpands.value, ...selectExpandPaths])
  const expandQuery = buildExpandQueryValue(mergedExpands)
  const query = buildODataQuery([
    ['$select', builderSelectedFields.value.length ? builderSelectedFields.value.join(',') : undefined],
    ['$expand', expandQuery || undefined],
    ['$filter', builderFilterExpression.value || undefined],
    ['$orderby', builderOrderByText.value.trim() || undefined],
    ['$top', builderTopValue.value > 0 ? String(builderTopValue.value) : undefined],
    ['$skip', builderSkipValue.value > 0 ? String(builderSkipValue.value) : undefined],
    ['$count', builderCountValue.value ? 'true' : undefined],
  ])
  const root = resolvedBuilderServiceRoot.value
  const normalizedPath = resourcePath.replace(/^\//, '')
  return `${root}/${normalizedPath}${query ? `?${query}` : ''}`
})

const filterSuggestionTemplates = computed(() => {
  return buildFilterTemplates(selectedEntityTypeForTryIt.value)
})

const formatTypeRef = (typeRef: TypeRef): string => `${typeRef.shortName}${typeRef.isCollection ? '[]' : ''}`

const termConfigSummary = computed(() => {
  if (!selectedTermNode.value?.config) {
    return ''
  }
  const exclude = new Set(['Nullable', 'DefaultValue', 'BaseTerm', 'AppliesTo'])
  const pairs = Object.entries(selectedTermNode.value.config).filter(([key, value]) => !exclude.has(key) && Boolean(value))
  return pairs.map(([key, value]) => `${key}=${value}`).join(', ')
})

const annotationLabel = (annotation: ODataAnnotationItem): string =>
  annotation.qualifier ? `${annotation.term}#${annotation.qualifier}` : annotation.term

const annotationSummary = (annotations: ODataAnnotationItem[], maxItems = 3): string => {
  if (!annotations.length) {
    return ''
  }
  const limited = annotations.slice(0, maxItems).map((item) => annotationLabel(item))
  const suffix = annotations.length > maxItems ? ` ...(+${annotations.length - maxItems})` : ''
  return `${limited.join(', ')}${suffix}`
}

const annotationFull = (annotations: ODataAnnotationItem[]): string => {
  if (!annotations.length) {
    return ''
  }
  return annotations
    .map((item) => `${annotationLabel(item)}=${item.value || '-'}`)
    .join('; ')
}

const isPrimaryKey = (name: string): boolean => selectedEntityTypeForDetails.value?.keyNames.includes(name) ?? false

const entitySetKey = (entitySet: ODataEntitySet): string => `entitySet:${entitySet.fullName}`
const entityTypeKey = (entityType: ODataEntityType): string => `entityType:${entityType.fullName}`

const syncTreeCurrentNode = (key: string) => {
  if (!key) {
    return
  }
  void nextTick(() => {
    treeRef.value?.setCurrentKey?.(key, true)
    const currentNodeElement = treeRef.value?.$el?.querySelector?.('.el-tree-node.is-current') as
      | HTMLElement
      | null
    currentNodeElement?.scrollIntoView({ block: 'nearest' })
  })
}

const findFirstLeafNode = (nodes: SchemaTreeNode[]): SchemaTreeNode | null => {
  for (const node of nodes) {
    if (node.kind !== 'namespace' && node.kind !== 'category') {
      return node
    }
    if (node.children?.length) {
      const found = findFirstLeafNode(node.children)
      if (found) {
        return found
      }
    }
  }
  return null
}

const useParsedModel = (model: ODataMetadataModel) => {
  metadataModel.value = model
  builderServiceRoot.value = model.serviceRoot ?? ''
  const firstLeaf = findFirstLeafNode(model.tree)
  selectedNodeKey.value = firstLeaf?.key ?? ''
  pageTab.value = 'explorer'
  activeTab.value = 'table'
  tryItResponse.value = ''
  syncTreeCurrentNode(selectedNodeKey.value)
}

const appendHistory = async (url: string) => {
  const normalized = url.trim()
  if (!normalized) {
    return
  }
  historyUrls.value = [normalized, ...historyUrls.value.filter((item) => item !== normalized)].slice(0, 10)
  await saveHistory(historyUrls.value)
}

const connectByXmlText = (xmlText: string, sourceLabel: string, serviceRoot?: string) => {
  const nextModel = parseODataMetadata(xmlText, sourceLabel, serviceRoot)
  useParsedModel(nextModel)
}

const handleConnectByUrl = async () => {
  const targetUrl = metadataUrl.value.trim()
  if (!targetUrl) {
    ElMessage.warning('请输入 Metadata URL')
    return
  }

  connecting.value = true
  try {
    const response = await axios.get<string>(targetUrl, {
      responseType: 'text',
      headers: {
        Accept: 'application/xml, text/xml, */*',
      },
    })
    connectByXmlText(response.data, targetUrl, extractServiceRoot(targetUrl))
    await appendHistory(targetUrl)
    ElMessage.success('Metadata connected successfully')
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Connection failed, please check URL or network'
    ElMessage.error(message)
  } finally {
    connecting.value = false
  }
}

const handlePickHistory = (pickedUrl: string | number | boolean) => {
  if (typeof pickedUrl !== 'string' || !pickedUrl) {
    return
  }
  metadataUrl.value = pickedUrl
  void handleConnectByUrl()
}

const loadSampleMetadata = () => {
  try {
    connectByXmlText(sampleMetadataXml, 'metadata.xml')
    ElMessage.success('Sample metadata loaded')
  } catch {
    ElMessage.error('Sample metadata parse failed')
  }
}

const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
  try {
    const xmlText = await file.text()
    connectByXmlText(xmlText, `Local File: ${file.name}`)
    ElMessage.success('Local XML imported successfully')
  } catch {
    ElMessage.error('XML parse failed, please check file content')
  }
  return false
}

const handleNodeClick = (node: SchemaTreeNode) => {
  if (node.kind === 'category' || node.kind === 'namespace') {
    return
  }
  selectedNodeKey.value = node.key
  activeTab.value = 'table'
}

let sidebarResizeStartX = 0
let sidebarResizeStartWidth = 300

const clampSidebarWidth = (width: number) => {
  const maxByViewport = Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - 360)
  const upper = Math.min(SIDEBAR_MAX_WIDTH, maxByViewport)
  return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), upper)
}

const handleSidebarResizeMove = (event: MouseEvent) => {
  if (!isSidebarResizing.value) {
    return
  }
  const delta = event.clientX - sidebarResizeStartX
  sidebarWidth.value = clampSidebarWidth(sidebarResizeStartWidth + delta)
}

const stopSidebarResize = () => {
  if (!isSidebarResizing.value) {
    return
  }
  isSidebarResizing.value = false
  window.removeEventListener('mousemove', handleSidebarResizeMove)
  window.removeEventListener('mouseup', stopSidebarResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

const startSidebarResize = (event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  if (window.matchMedia('(max-width: 1200px)').matches) {
    return
  }
  isSidebarResizing.value = true
  sidebarResizeStartX = event.clientX
  sidebarResizeStartWidth = sidebarWidth.value
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  window.addEventListener('mousemove', handleSidebarResizeMove)
  window.addEventListener('mouseup', stopSidebarResize)
}

const handleViewportResize = () => {
  sidebarWidth.value = clampSidebarWidth(sidebarWidth.value)
}

const openErDialog = () => {
  if (!canOpenErDialog.value) {
    return
  }
  erDialogVisible.value = true
}

const focusEntitySet = (entitySet: ODataEntitySet) => {
  const key = entitySetKey(entitySet)
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const focusEntityType = (entityType: ODataEntityType) => {
  const key = entityTypeKey(entityType)
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

interface NodeDragState {
  key: string
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  moved: boolean
}

let currentNodeDragState: NodeDragState | null = null
let diagramResizeObserver: ResizeObserver | null = null

const clampDiagramPosition = (x: number, y: number) => {
  const minPadding = 8
  const maxX = Math.max(minPadding, diagramWidth.value - diagramNodeWidth - minPadding)
  const maxY = Math.max(minPadding, diagramHeight.value - diagramNodeHeight - minPadding)
  return {
    x: Math.min(Math.max(minPadding, x), maxX),
    y: Math.min(Math.max(minPadding, y), maxY),
  }
}

const resetDiagramNodeOverrides = () => {
  diagramNodePositionOverrides.value = {}
}

const syncDiagramSize = () => {
  const board = diagramBoardRef.value
  if (!board) {
    return
  }
  const width = Math.max(640, Math.floor(board.clientWidth))
  const height = Math.max(520, Math.floor(board.clientHeight))
  diagramWidth.value = width
  diagramHeight.value = height
}

const startDiagramResizeObserve = () => {
  const board = diagramBoardRef.value
  if (!board) {
    return
  }
  diagramResizeObserver?.disconnect()
  diagramResizeObserver = new ResizeObserver(() => {
    syncDiagramSize()
  })
  diagramResizeObserver.observe(board)
  syncDiagramSize()
}

const stopDiagramResizeObserve = () => {
  diagramResizeObserver?.disconnect()
  diagramResizeObserver = null
}

const stopNodeDrag = () => {
  if (currentNodeDragState?.moved) {
    suppressedClickNodeKey.value = currentNodeDragState.key
  }
  currentNodeDragState = null
  draggingNodeKey.value = ''
  window.removeEventListener('mousemove', handleNodeDragMove)
  window.removeEventListener('mouseup', stopNodeDrag)
  document.body.style.userSelect = ''
}

const handleNodeDragMove = (event: MouseEvent) => {
  if (!currentNodeDragState) {
    return
  }
  const deltaX = event.clientX - currentNodeDragState.startPointerX
  const deltaY = event.clientY - currentNodeDragState.startPointerY
  if (!currentNodeDragState.moved && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
    currentNodeDragState.moved = true
  }
  const position = clampDiagramPosition(
    currentNodeDragState.startX + deltaX,
    currentNodeDragState.startY + deltaY,
  )
  diagramNodePositionOverrides.value = {
    ...diagramNodePositionOverrides.value,
    [currentNodeDragState.key]: position,
  }
}

const startNodeDrag = (node: DiagramNode, event: MouseEvent) => {
  if (event.button !== 0) {
    return
  }
  const currentNode = diagramNodes.value.find((item) => item.key === node.key) ?? node
  currentNodeDragState = {
    key: node.key,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: currentNode.x,
    startY: currentNode.y,
    moved: false,
  }
  draggingNodeKey.value = node.key
  suppressedClickNodeKey.value = ''
  window.addEventListener('mousemove', handleNodeDragMove)
  window.addEventListener('mouseup', stopNodeDrag)
  document.body.style.userSelect = 'none'
}

const handleDiagramNodeClick = (node: DiagramNode) => {
  if (suppressedClickNodeKey.value === node.key) {
    suppressedClickNodeKey.value = ''
    return
  }
  const targetEntitySet = findEntitySetByEntityType(node.entityType)
  if (targetEntitySet) {
    focusEntitySet(targetEntitySet)
    return
  }
  focusEntityType(node.entityType)
}

const focusAction = (action: ODataAction) => {
  const key = `action:${action.signature}`
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const focusFunction = (func: ODataFunction) => {
  const key = `function:${func.signature}`
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const jumpToOperationFromImport = (importNode: ODataActionImport | ODataFunctionImport) => {
  if (!metadataModel.value) {
    return
  }

  const resolveShortName = (name: string) => name.split('.').pop() ?? name

  if (importNode.kind === 'actionImport') {
    const fullName = importNode.action
    const shortName = resolveShortName(fullName)
    const action =
      metadataModel.value.actionMap[fullName] ??
      metadataModel.value.actions.find((item) => item.fullName === fullName || item.name === shortName)
    if (!action) {
      ElMessage.warning(`Cannot find Action: ${fullName}`)
      return
    }
    focusAction(action)
    return
  }

  const fullName = importNode.function
  const shortName = resolveShortName(fullName)
  const func =
    metadataModel.value.functionMap[fullName] ??
    metadataModel.value.functions.find((item) => item.fullName === fullName || item.name === shortName)
  if (!func) {
    ElMessage.warning(`Cannot find Function: ${fullName}`)
    return
  }
  focusFunction(func)
}

const jumpToNavigationTarget = (navigation: NavigationRow) => {
  if (navigation.targetEntitySet) {
    focusEntitySet(navigation.targetEntitySet)
    return
  }

  const targetType = findEntityTypeByTypeRef(navigation.type)
  if (targetType) {
    const key = `entityType:${targetType.fullName}`
    selectedNodeKey.value = key
    treeRef.value?.setCurrentKey?.(key)
    activeTab.value = 'table'
    return
  }

  ElMessage.warning(`未找到 ${navigation.type.shortName} 对应的 EntitySet/EntityType`)
}

const canOpenInheritance = computed(() => Boolean(selectedEntityTypeForDetails.value || selectedComplexTypeNode.value))

const inheritanceTooltip = computed(() => {
  if (!selectedLeafNode.value) {
    return 'Please select a type node first'
  }
  if (selectedEnumTypeNode.value) {
    return 'EnumType has no inheritance tree'
  }
  if (canOpenInheritance.value) {
    return 'View inheritance for current type'
  }
  return 'Current node does not support inheritance'
})

const inheritanceKind = computed<'entityType' | 'complexType'>(() =>
  selectedComplexTypeNode.value ? 'complexType' : 'entityType',
)

const inheritanceCurrentTypeName = computed(
  () => selectedComplexTypeNode.value?.fullName ?? selectedEntityTypeForDetails.value?.fullName ?? '',
)

const inheritanceTypesForDialog = computed<InheritanceDialogType[]>(() => {
  if (!metadataModel.value) {
    return []
  }

  return [
    ...metadataModel.value.entityTypes.map((item) => ({
      name: item.name,
      fullName: item.fullName,
      abstract: item.abstract,
      baseType: item.baseType,
      baseTypeFullName: item.baseTypeFullName,
      kind: 'entityType' as const,
    })),
    ...metadataModel.value.complexTypes.map((item) => ({
      name: item.name,
      fullName: item.fullName,
      abstract: item.abstract,
      baseType: item.baseType,
      baseTypeFullName: item.baseTypeFullName,
      kind: 'complexType' as const,
    })),
  ]
})

const selectedRawData = computed<unknown>(() => {
  if (!metadataModel.value || !selectedLeafNode.value) {
    return null
  }

  if (selectedEntitySetNode.value) {
    const entityType = selectedEntityTypeForDetails.value
    return {
      entitySet:
        metadataModel.value.rawNodeMap[`entitySet:${selectedEntitySetNode.value.fullName}`] ??
        selectedEntitySetNode.value,
      entityType: entityType
        ? metadataModel.value.rawNodeMap[`entityType:${entityType.fullName}`] ?? entityType
        : null,
    }
  }

  if (selectedEntityTypeNode.value) {
    return (
      metadataModel.value.rawNodeMap[`entityType:${selectedEntityTypeNode.value.fullName}`] ??
      selectedEntityTypeNode.value
    )
  }

  if (selectedComplexTypeNode.value) {
    return (
      metadataModel.value.rawNodeMap[`complexType:${selectedComplexTypeNode.value.fullName}`] ??
      selectedComplexTypeNode.value
    )
  }

  if (selectedEnumTypeNode.value) {
    return metadataModel.value.rawNodeMap[`enumType:${selectedEnumTypeNode.value.fullName}`] ?? selectedEnumTypeNode.value
  }

  if (selectedTermNode.value) {
    return metadataModel.value.rawNodeMap[`term:${selectedTermNode.value.fullName}`] ?? selectedTermNode.value
  }

  if (selectedActionNode.value) {
    return metadataModel.value.rawNodeMap[`action:${selectedActionNode.value.signature}`] ?? selectedActionNode.value
  }

  if (selectedFunctionNode.value) {
    return (
      metadataModel.value.rawNodeMap[`function:${selectedFunctionNode.value.signature}`] ?? selectedFunctionNode.value
    )
  }

  if (selectedActionImportNode.value) {
    return (
      metadataModel.value.rawNodeMap[`actionImport:${selectedActionImportNode.value.fullName}`] ??
      selectedActionImportNode.value
    )
  }

  if (selectedFunctionImportNode.value) {
    return (
      metadataModel.value.rawNodeMap[`functionImport:${selectedFunctionImportNode.value.fullName}`] ??
      selectedFunctionImportNode.value
    )
  }

  return null
})

const rawDialogTitle = computed(() => {
  if (selectedEntitySetNode.value) {
    return `原始 JSON - EntitySet ${selectedEntitySetNode.value.name}`
  }
  if (selectedEntityTypeNode.value) {
    return `原始 JSON - EntityType ${selectedEntityTypeNode.value.name}`
  }
  if (selectedComplexTypeNode.value) {
    return `原始 JSON - ComplexType ${selectedComplexTypeNode.value.name}`
  }
  if (selectedEnumTypeNode.value) {
    return `原始 JSON - EnumType ${selectedEnumTypeNode.value.name}`
  }
  if (selectedTermNode.value) {
    return `原始 JSON - Term ${selectedTermNode.value.name}`
  }
  if (selectedActionNode.value) {
    return `原始 JSON - Action ${selectedActionNode.value.name}`
  }
  if (selectedFunctionNode.value) {
    return `原始 JSON - Function ${selectedFunctionNode.value.name}`
  }
  if (selectedActionImportNode.value) {
    return `原始 JSON - ActionImport ${selectedActionImportNode.value.name}`
  }
  if (selectedFunctionImportNode.value) {
    return `原始 JSON - FunctionImport ${selectedFunctionImportNode.value.name}`
  }
  return '原始 JSON'
})

const openRawDialog = () => {
  if (!selectedLeafNode.value) {
    return
  }
  rawDialogVisible.value = true
}

const openInheritanceDialog = () => {
  if (!canOpenInheritance.value) {
    return
  }
  inheritanceDialogVisible.value = true
}

const handleInheritanceTypeSelect = (payload: { fullName: string; kind: 'entityType' | 'complexType' }) => {
  const key = `${payload.kind}:${payload.fullName}`
  if (!treeNodeMap.value[key]) {
    ElMessage.warning(`Node not found for ${payload.fullName}`)
    return
  }
  selectedNodeKey.value = key
  treeRef.value?.setCurrentKey?.(key)
  activeTab.value = 'table'
}

const copyTsCode = async () => {
  try {
    await navigator.clipboard.writeText(tsCode.value)
    ElMessage.success('TypeScript definition copied')
  } catch {
    ElMessage.error('Copy failed, please copy manually')
  }
}

const runTryIt = async () => {
  if (!generatedTryItUrl.value) {
    ElMessage.warning('请先生成有效的请求 URL（需要选中 EntitySet 并可用服务根）')
    return
  }
  tryItLoading.value = true
  try {
    const response = await axios.get(generatedTryItUrl.value, {
      headers: {
        Accept: 'application/json',
      },
    })
    tryItResponse.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Request failed'
    tryItResponse.value = message
    ElMessage.error(message)
  } finally {
    tryItLoading.value = false
  }
}

const copyBuilderUrl = async () => {
  if (!generatedBuilderUrl.value) {
    ElMessage.warning('请先生成请求 URL')
    return
  }
  try {
    await navigator.clipboard.writeText(generatedBuilderUrl.value)
    ElMessage.success('Request URL copied')
  } catch {
    ElMessage.error('Copy failed, please copy manually')
  }
}

const runBuilderRequest = async () => {
  if (!generatedBuilderUrl.value) {
    ElMessage.warning('请先生成请求 URL')
    return
  }
  try {
    builderRequestLoading.value = true
    const response = await axios.get(generatedBuilderUrl.value, {
      headers: {
        Accept: 'application/json',
      },
    })
    builderResponseText.value = JSON.stringify(response.data, null, 2)
  } catch (error) {
    const message = axios.isAxiosError(error) ? error.message : 'Request failed'
    builderResponseText.value = message
    ElMessage.error(message)
  } finally {
    builderRequestLoading.value = false
  }
}

const queryFilterSuggestion = (
  query: string,
  callback: (items: Array<{ value: string }>) => void,
) => {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    callback(filterSuggestionTemplates.value.slice(0, 12))
    return
  }
  const matched = filterSuggestionTemplates.value.filter((item) =>
    item.value.toLowerCase().includes(keyword),
  )
  callback(matched.slice(0, 12))
}

watch(
  selectedEntityTypeForTryIt,
  (entityType) => {
    if (!entityType) {
      selectedFields.value = []
      selectedExpands.value = []
      filterText.value = ''
      topValue.value = 20
      return
    }
    selectedFields.value = entityType.properties.slice(0, 8).map((item) => item.name)
    selectedExpands.value = []
    filterText.value = ''
    topValue.value = 20
    tryItResponse.value = ''
  },
  { immediate: true },
)

watch(
  tryItSelectableLeafValues,
  (allowedValues) => {
    if (!selectedFields.value.length) {
      return
    }
    const allowedSet = new Set(allowedValues)
    selectedFields.value = selectedFields.value.filter((item) => allowedSet.has(item))
  },
  { immediate: true },
)

watch(
  [selectedNodeKey, selectedEntityTypeForBuilder, selectedEntitySetForBuilder],
  ([, entityType, entitySet]) => {
    if (!entityType) {
      builderResourcePath.value = ''
      builderSelectedFields.value = []
      builderSelectedExpands.value = []
      builderFilterField.value = ''
      builderFilterOperator.value = 'eq'
      builderFilterValue.value = ''
      builderOrderByText.value = ''
      builderTopValue.value = 20
      builderSkipValue.value = 0
      builderCountValue.value = false
      builderResponseText.value = ''
      return
    }

    builderResourcePath.value = entitySet?.name ?? entityType.name
    builderSelectedFields.value = entityType.properties.slice(0, 8).map((item) => item.name)
    builderSelectedExpands.value = []
    builderFilterField.value = entityType.properties[0]?.name ?? ''
    builderFilterOperator.value = 'eq'
    builderFilterValue.value = ''
    builderOrderByText.value = ''
    builderTopValue.value = 20
    builderSkipValue.value = 0
    builderCountValue.value = false
    builderResponseText.value = ''
  },
  { immediate: true },
)

watch(
  builderSelectableLeafValues,
  (allowedValues) => {
    if (!builderSelectedFields.value.length) {
      return
    }
    const allowedSet = new Set(allowedValues)
    builderSelectedFields.value = builderSelectedFields.value.filter((item) => allowedSet.has(item))
  },
  { immediate: true },
)

watch(
  builderFilterFieldOptions,
  (options) => {
    const values = new Set(options.map((item) => item.value))
    if (!values.size) {
      builderFilterField.value = ''
      return
    }
    if (!builderFilterField.value || !values.has(builderFilterField.value)) {
      builderFilterField.value = options[0].value
    }
  },
  { immediate: true },
)

watch(treeData, () => {
  if (!selectedNodeKey.value) {
    return
  }
  syncTreeCurrentNode(selectedNodeKey.value)
})

watch(
  selectedNodeKey,
  (key) => {
    if (!key) {
      return
    }
    syncTreeCurrentNode(key)
  },
  { flush: 'post' },
)

watch(
  erCenterEntityType,
  (entityType, previousEntityType) => {
    if (!entityType) {
      resetDiagramNodeOverrides()
      if (erDialogVisible.value) {
        erDialogVisible.value = false
      }
      return
    }

    if (previousEntityType && previousEntityType.fullName === entityType.fullName) {
      return
    }

    resetDiagramNodeOverrides()
    suppressedClickNodeKey.value = ''
    if (erDialogVisible.value) {
      nextTick(() => {
        syncDiagramSize()
      })
    }
  },
)

watch(erDialogVisible, (visible) => {
  if (visible) {
    stopNodeDrag()
    resetDiagramNodeOverrides()
    suppressedClickNodeKey.value = ''
    nextTick(() => {
      startDiagramResizeObserve()
    })
    return
  }
  stopNodeDrag()
  stopDiagramResizeObserve()
})

onMounted(async () => {
  sidebarWidth.value = clampSidebarWidth(sidebarWidth.value)
  window.addEventListener('resize', handleViewportResize)
  historyUrls.value = await loadHistory()
  loadSampleMetadata()
})

onBeforeUnmount(() => {
  stopSidebarResize()
  window.removeEventListener('resize', handleViewportResize)
  stopNodeDrag()
  stopDiagramResizeObserve()
})

interface DiagramNode {
  key: string
  x: number
  y: number
  entityType: ODataEntityType
  isCenter: boolean
}

interface DiagramLine {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

interface EntityTypeRelationEdge {
  key: string
  sourceEntityTypeFullName: string
  targetEntityTypeFullName: string
  cardinality: ODataRelationCardinality
  navigationNames: string[]
}

const mergeRelationCardinality = (
  left: ODataRelationCardinality,
  right: ODataRelationCardinality,
): ODataRelationCardinality => {
  if (left === 'N:N' || right === 'N:N') {
    return 'N:N'
  }
  if (left === '1:N' || right === '1:N') {
    return '1:N'
  }
  return '1:1'
}

const centerRelationEdges = computed<EntityTypeRelationEdge[]>(() => {
  const center = erCenterEntityType.value
  if (!center || !metadataModel.value) {
    return []
  }

  const merged: Record<string, EntityTypeRelationEdge> = {}
  const appendEdge = (targetFullName: string, cardinality: ODataRelationCardinality, navigationName: string) => {
    if (targetFullName === center.fullName) {
      return
    }
    const key = `${center.fullName}->${targetFullName}`

    if (!merged[key]) {
      merged[key] = {
        key,
        sourceEntityTypeFullName: center.fullName,
        targetEntityTypeFullName: targetFullName,
        cardinality,
        navigationNames: navigationName ? [navigationName] : [],
      }
      return
    }

    merged[key].cardinality = mergeRelationCardinality(merged[key].cardinality, cardinality)
    if (navigationName && !merged[key].navigationNames.includes(navigationName)) {
      merged[key].navigationNames.push(navigationName)
    }
  }

  for (const navigation of center.navigationProperties) {
    const target = findEntityTypeByTypeRef(navigation.type)
    if (!target) {
      continue
    }
    const reverseNavigation = findReverseNavigation(center, target, navigation)
    const cardinality = resolveCardinalityFromNavigation(navigation, reverseNavigation)
    appendEdge(target.fullName, cardinality, navigation.name)
  }

  return Object.values(merged).sort((left, right) =>
    left.targetEntityTypeFullName.localeCompare(right.targetEntityTypeFullName),
  )
})

const diagramRelatedEntityTypes = computed<ODataEntityType[]>(() => {
  if (!metadataModel.value || !erCenterEntityType.value) {
    return []
  }

  const relatedFullNames = new Set<string>()
  for (const edge of centerRelationEdges.value) {
    relatedFullNames.add(edge.targetEntityTypeFullName)
  }

  const all = Array.from(relatedFullNames)
    .map((fullName) => metadataModel.value?.entityTypeMap[fullName])
    .filter((item): item is ODataEntityType => Boolean(item))
    .sort((left, right) => left.name.localeCompare(right.name))

  return all.slice(0, Math.max(1, DIAGRAM_MAX_NODES - 1))
})

const diagramOverflowCount = computed(() => {
  if (!metadataModel.value || !erCenterEntityType.value) {
    return 0
  }

  const relatedFullNames = new Set<string>()
  for (const edge of centerRelationEdges.value) {
    relatedFullNames.add(edge.targetEntityTypeFullName)
  }

  const maxOthers = Math.max(1, DIAGRAM_MAX_NODES - 1)
  return Math.max(0, relatedFullNames.size - maxOthers)
})

const autoLayoutDiagramNodes = computed<DiagramNode[]>(() => {
  const centerType = erCenterEntityType.value
  if (!centerType) {
    return []
  }

  const centerX = diagramWidth.value / 2
  const centerY = diagramHeight.value / 2
  const nodes: DiagramNode[] = [
    {
      key: entityTypeKey(centerType),
      x: centerX - diagramNodeWidth / 2,
      y: centerY - diagramNodeHeight / 2,
      entityType: centerType,
      isCenter: true,
    },
  ]

  const others = diagramRelatedEntityTypes.value
  if (!others.length) {
    return nodes
  }

  const rings = Math.ceil(others.length / 10)
  const maxRadius = Math.max(
    60,
    Math.min(
      (diagramWidth.value - diagramNodeWidth - 40) / 2,
      (diagramHeight.value - diagramNodeHeight - 40) / 2,
    ),
  )
  let consumed = 0

  for (let ringIndex = 0; ringIndex < rings; ringIndex++) {
    const remain = others.length - consumed
    const currentCount = Math.min(10, remain)
    const currentRadius = (maxRadius * (ringIndex + 1)) / rings

    for (let i = 0; i < currentCount; i++) {
      const target = others[consumed + i]
      const angle = (Math.PI * 2 * i) / currentCount - Math.PI / 2
      nodes.push({
        key: entityTypeKey(target),
        x: centerX + currentRadius * Math.cos(angle) - diagramNodeWidth / 2,
        y: centerY + currentRadius * Math.sin(angle) - diagramNodeHeight / 2,
        entityType: target,
        isCenter: false,
      })
    }

    consumed += currentCount
  }

  return nodes
})

const diagramNodes = computed<DiagramNode[]>(() =>
  autoLayoutDiagramNodes.value.map((node) => {
    const override = diagramNodePositionOverrides.value[node.key]
    if (!override) {
      return node
    }
    const position = clampDiagramPosition(override.x, override.y)
    return {
      ...node,
      x: position.x,
      y: position.y,
    }
  }),
)

const diagramLines = computed<DiagramLine[]>(() => {
  if (!centerRelationEdges.value.length || !erCenterEntityType.value) {
    return []
  }

  const nodeByEntityType = Object.fromEntries(
    diagramNodes.value.map((node) => [node.entityType.fullName, node] as const),
  )

  const lines: DiagramLine[] = []
  for (const edge of centerRelationEdges.value) {
    const sourceNode = nodeByEntityType[edge.sourceEntityTypeFullName]
    const targetNode = nodeByEntityType[edge.targetEntityTypeFullName]
    if (!sourceNode || !targetNode) {
      continue
    }

    lines.push({
      key: edge.key,
      x1: sourceNode.x + diagramNodeWidth / 2,
      y1: sourceNode.y + diagramNodeHeight / 2,
      x2: targetNode.x + diagramNodeWidth / 2,
      y2: targetNode.y + diagramNodeHeight / 2,
      label: `${edge.navigationNames.join(', ') || 'Navigation'} (${edge.cardinality})`,
    })
  }

  return lines
})
</script>

<style scoped>
.workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.page-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.connect-card {
  flex-shrink: 0;
}

.connect-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.secondary-row {
  margin-top: 12px;
  align-items: start;
}

.history-select {
  width: 100%;
}

.upload-box {
  width: 320px;
}

.workspace {
  flex: 1;
  height: 100%;
  display: grid;
  grid-template-columns: 300px 12px minmax(0, 1fr);
  gap: 0;
  min-height: 0;
}

.sidebar-card {
  min-height: 0;
}

.sidebar-resizer {
  position: relative;
  min-height: 0;
  cursor: col-resize;
}

.sidebar-resizer::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #e4e7ed;
  border-radius: 999px;
  transition: background-color 0.2s ease;
}

.sidebar-resizer:hover::before,
.sidebar-resizer.active::before {
  background: #409eff;
}

.sidebar-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.sidebar-card :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #eaf3ff;
  color: #1d4ed8;
}

.sidebar-card :deep(.el-tree-node.is-current > .el-tree-node__content .schema-tree-node-label) {
  font-weight: 600;
}

.viewer-area {
  min-height: 0;
  min-width: 0;
  display: block;
}

.viewer-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  overflow: auto;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
}

.sub-title {
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
}

.schema-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.schema-tree-node-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-card {
  margin-top: 12px;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
  cursor: default;
}

.option-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.alert-space {
  margin-bottom: 12px;
}

.try-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.builder-inline-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.filter-builder-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px minmax(0, 1fr);
  gap: 8px;
}

.filter-preview {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  word-break: break-all;
}

.builder-actions {
  display: flex;
  gap: 8px;
}

.diagram-toolbar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.er-diagram-content {
  height: calc(92vh - 96px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.diagram-board {
  position: relative;
  flex: 1 0 auto;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.diagram-board-scroll {
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: auto;
  display: flex;
}

.diagram-board svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.diagram-node {
  position: absolute;
  width: 190px;
  height: 72px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  padding: 10px;
  cursor: grab;
  transition: box-shadow 0.2s ease;
}

.diagram-node:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.diagram-node.dragging {
  cursor: grabbing;
}

.diagram-node.center {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgb(64 158 255 / 26%);
}

.diagram-node-title {
  font-weight: 600;
  font-size: 13px;
}

.diagram-node-type {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.er-diagram-dialog :deep(.el-dialog) {
  height: 92vh;
  display: flex;
  flex-direction: column;
}

.er-diagram-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .workspace {
    grid-template-columns: 1fr !important;
  }

  .sidebar-resizer {
    display: none;
  }

  .try-grid {
    grid-template-columns: 1fr;
  }

  .filter-builder-row {
    grid-template-columns: 1fr;
  }

  .diagram-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
