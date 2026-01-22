export const transformToTree = (schemas: any[]) => {
    let temp_id = 10000
    return schemas.map(schema => {
        const children: any[] = [];
        // 1. 处理 EntityType (实体类型)
        if (schema.entityType && schema.entityType.length) {
            children.push({
                label: 'EntityTypes',
                type: 'category',
                id: temp_id++,
                children: schema.entityType.map((t: any) => ({
                    label: t.name,
                    type: 'entityType',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        // 2. 处理 ComplexType (复杂类型)
        if (schema.complexType && schema.complexType.length) {
            children.push({
                label: 'ComplexTypes',
                type: 'category',
                id: temp_id++,
                children: schema.complexType.map((t: any) => ({
                    label: t.name,
                    type: 'complexType',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        // 3. 处理 EnumType (枚举类型)
        if (schema.enumType && schema.enumType.length) {
            children.push({
                label: 'EnumTypes',
                type: 'category',
                id: temp_id++,
                children: schema.enumType.map((t: any) => ({
                    label: t.name,
                    type: 'enumType',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        // 4. 处理 Term (语义)
        if (schema.term && schema.term.length) {
            children.push({
                label: 'Terms',
                type: 'category',
                id: temp_id++,
                children: schema.term.map((t: any) => ({
                    label: t.name,
                    type: 'term',
                    id: temp_id++,
                    data: t
                }))
            });
        }
        // 5. 处理 EntityContainer (实体容器)
        if (schema.entityContainer) {
            children.push({
                label: 'EntityContainer',
                type: 'category',
                id: temp_id++,
                children: {}
            });
            let newchildren = []
            if (schema.entityContainer.actionImport && schema.entityContainer.actionImport.length) {
                newchildren.push({
                    label: 'ActionImport',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.actionImport.map((t: any) => ({
                        label: t.name,
                        type: 'actionImport',
                        id: temp_id++,
                        data: t
                    }))
                });
            }

            if (schema.entityContainer.entitySet && schema.entityContainer.entitySet.length) {
                newchildren.push({
                    label: 'EntitySet',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.entitySet.map((t: any) => ({
                        label: t.name,
                        type: 'entitySet',
                        id: temp_id++,
                        data: t
                    }))
                });
            }

            if (schema.entityContainer.functionImport && schema.entityContainer.functionImport.length) {
                newchildren.push({
                    label: 'FunctionImport',
                    type: 'category',
                    id: temp_id++,
                    children: schema.entityContainer.functionImport.map((t: any) => ({
                        label: t.name,
                        type: 'functionImport',
                        id: temp_id++,
                        data: t
                    }))
                });
            }
            children[children.length - 1].children = newchildren;
        }

        if (schema.function && schema.function.length) {
            children.push({
                label: 'Function',
                type: 'category',
                id: temp_id++,
                children: schema.function.map((t: any) => ({
                    label: t.name,
                    type: 'function',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        if (schema.action && schema.action.length) {
            children.push({
                label: 'Action',
                type: 'category',
                id: temp_id++,
                children: schema.action.map((t: any) => ({
                    label: t.name,
                    type: 'action',
                    id: temp_id++,
                    data: t
                }))
            });
        }

        return {
            label: schema.namespace || schema.alias || 'Unknown Namespace',
            type: 'namespace',
            id: temp_id++,
            children: children
        };
    });
};