import { HandoverItem } from '../types';

const STORAGE_KEY = 'duty_handover_items';

export const getItems = (): HandoverItem[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveItems = (items: HandoverItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addItem = (item: Omit<HandoverItem, 'id' | 'createdAt' | 'updatedAt'>): HandoverItem => {
  const items = getItems();
  const newItem: HandoverItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.unshift(newItem);
  saveItems(items);
  return newItem;
};

export const updateItem = (id: string, updates: Partial<HandoverItem>): HandoverItem | null => {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveItems(items);
  return items[index];
};

export const deleteItem = (id: string): boolean => {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  saveItems(filtered);
  return true;
};

export const completeItem = (id: string, remarks?: string): HandoverItem | null => {
  return updateItem(id, {
    status: 'completed' as any,
    completedAt: new Date().toISOString(),
    remarks
  });
};
