import AsyncStorage from "@react-native-async-storage/async-storage";

// Generic save
export const saveToStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log(`Storage save error for key "${key}":`, e);
  }
};

// Generic read
export const getFromStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log(`Storage read error for key "${key}":`, e);
    return null;
  }
};

// Generic delete
export const removeFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log(`Storage remove error for key "${key}":`, e);
  }
};

// Clear everything (useful for logout)
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.log("Storage clear error:", e);
  }
};
