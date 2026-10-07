export const initializeApp = (cfg, name) => ({ name: name || '[DEFAULT]', options: cfg });
export const getApp = () => ({ name: '[DEFAULT]' });
export const getApps = () => [];
export const deleteApp = async () => {};
