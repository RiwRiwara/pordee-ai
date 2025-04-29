/**
 * Utilities for managing debt data in localStorage for guest mode
 */

export interface LocalDebtItem {
  id: string;
  name: string;
  debtType: string;
  paymentType: 'installment' | 'revolving';
  totalAmount: string;
  minimumPayment: string;
  interestRate: string;
  dueDate: string;
  paymentStatus: string;
  attachments?: Array<{
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

const LOCAL_STORAGE_DEBTS_KEY = 'pordee-guest-debts';

/**
 * Get all debts from localStorage
 */
export function getLocalDebts(): LocalDebtItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedDebts = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
    return storedDebts ? JSON.parse(storedDebts) : [];
  } catch (error) {
    console.error('Error retrieving debts from localStorage:', error);
    return [];
  }
}

/**
 * Save a new debt to localStorage
 */
export function saveLocalDebt(
  debt: Omit<LocalDebtItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): LocalDebtItem {
  const debts = getLocalDebts();

  const now = new Date().toISOString();
  const newDebt: LocalDebtItem = {
    ...debt,
    id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now,
    deletedAt: ""
  };

  localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify([newDebt, ...debts]));
  return newDebt;
}

/**
 * Update an existing debt in localStorage
 */
export function updateLocalDebt(updatedDebt: LocalDebtItem): LocalDebtItem | null {
  const debts = getLocalDebts();
  const index = debts.findIndex(debt => debt.id === updatedDebt.id);

  if (index === -1) return null;

  const now = new Date().toISOString();
  const newDebt = {
    ...updatedDebt,
    updatedAt: now,
    deletedAt: ""
  };

  debts[index] = newDebt;
  localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(debts));
  return newDebt;
}

/**
 * Delete a debt from localStorage
 */
export function deleteLocalDebt(id: string): boolean {
  const debts = getLocalDebts();
  const filteredDebts = debts.filter(debt => debt.id !== id);

  if (filteredDebts.length === debts.length) return false;

  localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(filteredDebts));
  return true;
}

/**
 * Clear all debts from localStorage
 */
export function clearLocalDebts(): void {
  localStorage.removeItem(LOCAL_STORAGE_DEBTS_KEY);
}
