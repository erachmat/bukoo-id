'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function updateUserRole(userId: string, role: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
  })
  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}
