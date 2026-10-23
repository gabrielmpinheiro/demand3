/**
 * Gerenciador de Recursos (Feature Flags) do Painel do Cliente
 * 
 * Permite consultar se uma funcionalidade está ativa ou inativa.
 * Os valores são carregados dinamicamente a partir de config/features.php (injetados no window.APP_CONFIG)
 * ou armazenados no localStorage/contexto.
 */

export const defaultFeatures = {
    invoices: false,
    subscriptions: true,
    tickets: true,
    domains: true,
    vault: true,
    users: true,
    notifications: true,
};

export const getFeatures = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG?.features) {
        return window.APP_CONFIG.features;
    }
    return defaultFeatures;
};

export const isFeatureEnabled = (featureKey) => {
    const features = getFeatures();
    if (typeof features[featureKey] !== 'undefined') {
        return Boolean(features[featureKey]);
    }
    return defaultFeatures[featureKey] ?? true;
};
