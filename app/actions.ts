'use server';

import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { getAllPapers, savePapers } from '@/lib/storage';
import { isAuthenticated, authenticate as authUser, logout as logoutUser } from '@/lib/auth';
import { Paper } from '@/types/paper';

export async function getPapers(): Promise<Paper[]> {
  const papers = await getAllPapers();
  return papers as Paper[];
}

export async function addPaper(x: number, y: number): Promise<{ success: boolean; paper?: Paper }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false };
  }

  const papers = await getAllPapers() as Paper[];
  const newPaper: Paper = {
    id: uuidv4(),
    text: '',
    x,
    y,
    rotation: (Math.random() - 0.5) * 10, // Random rotation between -5 and 5 degrees
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  papers.push(newPaper);
  await savePapers(papers);
  revalidatePath('/');

  return { success: true, paper: newPaper };
}

export async function updatePaper(
  id: string,
  updates: Partial<Omit<Paper, 'id' | 'createdAt'>>
): Promise<{ success: boolean }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false };
  }

  const papers = await getAllPapers() as Paper[];
  const index = papers.findIndex((p: Paper) => p.id === id);

  if (index === -1) {
    return { success: false };
  }

  papers[index] = {
    ...papers[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await savePapers(papers);
  revalidatePath('/');

  return { success: true };
}

export async function deletePaper(id: string): Promise<{ success: boolean }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false };
  }

  const papers = await getAllPapers() as Paper[];
  const filtered = papers.filter((p: Paper) => p.id !== id);

  await savePapers(filtered);
  revalidatePath('/');

  return { success: true };
}

export async function authenticate(password: string): Promise<{ success: boolean }> {
  const result = await authUser(password);
  if (result) {
    revalidatePath('/');
  }
  return { success: result };
}

export async function logout(): Promise<void> {
  await logoutUser();
  revalidatePath('/');
}

export async function checkAuth(): Promise<boolean> {
  return await isAuthenticated();
}
