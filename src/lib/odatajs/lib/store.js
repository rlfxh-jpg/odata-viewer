/** @module store */

// 启用严格模式（推荐）
'use strict'

exports.defaultStoreMechanism = 'best'

// 先导入模块，并正确声明变量
const DomStore = require('./store/dom.js')
const IndexedDBStore = require('./store/indexeddb.js')
const MemoryStore = require('./store/memory.js')

/** Creates a new store object.
 * @param {String} name - Store name.
 * @param {String} [mechanism] - Storage mechanism ('dom', 'indexeddb', 'memory', or 'best').
 * @returns {Object} Store instance.
 */
exports.createStore = function (name, mechanism) {
  if (!mechanism) {
    mechanism = exports.defaultStoreMechanism
  }

  if (mechanism === 'best') {
    // 现在 DomStore 已经定义
    mechanism = DomStore.isSupported() ? 'dom' : 'memory'
  }

  const factory = exports.mechanisms[mechanism]
  if (factory) {
    return factory.create(name)
  }

  throw new Error(
    `Failed to create store: name=${name}, mechanism=${mechanism}`
  )
}

// 导出模块
exports.DomStore = DomStore
exports.IndexedDBStore = IndexedDBStore
exports.MemoryStore = MemoryStore

// 现在再定义 mechanisms，确保所有变量已初始化
exports.mechanisms = {
  indexeddb: IndexedDBStore,
  dom: DomStore,
  memory: MemoryStore,
}
