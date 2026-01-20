/**
 * 仅保留元数据解析核心逻辑
 * 已转换为 ES 模块格式
 */

// 1. 将 require 替换为 import
// 注意：如果 metadata.js 还没改，这里引用的路径可能需要根据实际情况调整
import { metadataParser, metadataHandler } from './odata/metadata.js';

/**
 * 将 CSDL ($metadata XML) 字符串解析为 JSON 格式的元数据对象
 */
export function parseMetadata(csdlMetadataDocument) {
    // 第一个参数是 baseURI，解析本地字符串通常传 null
    return metadataParser(null, csdlMetadataDocument);
}

// 导出 handler
export { metadataHandler };

// 默认导出方便使用
export default {
    parseMetadata,
    metadataHandler
};