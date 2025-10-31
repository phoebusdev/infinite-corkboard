'use server';

import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import {
  getAllPapers,
  addPaperToStore,
  updatePaperInStore,
  deletePaperFromStore,
  batchUpdatePositions,
} from '@/lib/storage/storage';
import { isAuthenticated, authenticate as authUser, logout as logoutUser } from '@/lib/auth/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { getClientIp } from '@/lib/auth/ip';
import { Paper, PaperColor } from '@/types/paper';

export async function getPapers(): Promise<Paper[]> {
  const papers = await getAllPapers();
  return papers as Paper[];
}

export async function addPaper(
  x: number,
  y: number,
  color?: PaperColor
): Promise<{ success: boolean; paper?: Paper; error?: string }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const paper = await addPaperToStore({
      id: uuidv4(),
      text: '',
      x,
      y,
      color: color || PaperColor.Yellow,
    });

    revalidatePath('/');
    return { success: true, paper };
  } catch (error) {
    console.error('Add paper error:', error);
    return { success: false, error: 'Failed to add paper' };
  }
}

export async function updatePaper(
  id: string,
  updates: Partial<Paper>,
  expectedVersion: number
): Promise<{
  success: boolean;
  paper?: Paper;
  error?: string;
  conflict?: boolean;
}> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await updatePaperInStore(id, updates, expectedVersion);

    if (result.conflict) {
      return {
        success: false,
        conflict: true,
        paper: result.currentPaper,
        error: 'Version conflict - paper was modified by another process',
      };
    }

    revalidatePath('/');
    return { success: true, paper: result.paper };
  } catch (error) {
    console.error('Update paper error:', error);
    return { success: false, error: 'Failed to update paper' };
  }
}

export async function deletePaper(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await deletePaperFromStore(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete paper error:', error);
    return { success: false, error: 'Failed to delete paper' };
  }
}

export async function updatePaperPositions(
  updates: Array<{ id: string; x: number; y: number; version: number }>
): Promise<{ success: boolean; errors?: string[] }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, errors: ['Unauthorized'] };
  }

  const result = await batchUpdatePositions(updates);
  revalidatePath('/');
  return result;
}

export async function authenticate(
  password: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  // Get client IP for rate limiting
  const clientIp = await getClientIp();

  // Check rate limit
  const rateLimit = await checkRateLimit(clientIp, 'login');
  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    };
  }

  // Attempt authentication
  const result = await authUser(password);

  if (result) {
    // Reset rate limit on successful login
    await resetRateLimit(clientIp, 'login');
    revalidatePath('/');
    return { success: true };
  }

  return {
    success: false,
    error: 'Invalid password',
  };
}

export async function logout(): Promise<void> {
  await logoutUser();
  revalidatePath('/');
}

export async function checkAuth(): Promise<boolean> {
  return await isAuthenticated();
}
