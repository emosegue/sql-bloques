import { mockSchema } from '../components/BlocklyWorkspace/mocks'

export function getNormalizedSchema(databaseTables) {
    const schema =
        Array.isArray(databaseTables) && databaseTables.length === 0
            ? mockSchema
            : databaseTables
    return Array.isArray(schema) ? { tables: schema } : schema
}