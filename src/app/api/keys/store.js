// In-memory storage for API keys (replace with a database in production)
let apiKeys = [];

export const getKeys = () => apiKeys;
export const setKeys = (keys) => {
  apiKeys = keys;
};
export const addKey = (key) => {
  apiKeys.push(key);
};
export const updateKey = (id, updatedData) => {
  const index = apiKeys.findIndex(key => key.id === id);
  if (index === -1) return null;
  
  apiKeys[index] = {
    ...apiKeys[index],
    ...updatedData
  };
  return apiKeys[index];
};
export const deleteKey = (id) => {
  const index = apiKeys.findIndex(key => key.id === id);
  if (index === -1) return false;
  
  apiKeys.splice(index, 1);
  return true;
};
export const findKey = (id) => {
  return apiKeys.find(key => key.id === id);
}; 