import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';
import enTooltips from './tooltips/en.json';
import esTooltips from './tooltips/es.json';

export const translations = {
    en: enTranslations,
    es: esTranslations
};

export const tooltips = {
    en: enTooltips,
    es: esTooltips
};

let currentLanguage = localStorage.getItem('language') || 'es';

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function i18n(key) {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
}

export function getTooltip(blockType) {
    const langTooltips = tooltips[currentLanguage] || tooltips['en'];
    const tooltipMap = {
        sql_select: langTooltips.SELECT,
        sql_insert: langTooltips.INSERT,
        sql_update: langTooltips.UPDATE,
        sql_delete: langTooltips.DELETE,
        sql_where: langTooltips.WHERE,
        sql_join: langTooltips.JOIN,
        sql_group_by: langTooltips.GROUP_BY,
        sql_order_by: langTooltips.ORDER_BY,
        sql_having: langTooltips.HAVING,
        sql_limit: langTooltips.LIMIT,
        sql_union: langTooltips.UNION,
        sql_attribute: langTooltips.ATTRIBUTE,
        sql_constant: langTooltips.CONSTANT,
        sql_condition: langTooltips.CONDITION,
        sql_create_table: langTooltips.CREATE_TABLE,
        sql_alter_table: langTooltips.ALTER_TABLE,
        sql_constant_pair: langTooltips.ATTRIBUTE_CONSTANT_PAIR,
        sql_drop_table: langTooltips.DROP_TABLE,
        sql_begin_transaction: langTooltips.BEGIN_TRANSACTION,
        sql_commit: langTooltips.COMMIT,
        sql_rollback: langTooltips.ROLLBACK,
    };

    return tooltipMap[blockType] || '';
}
