import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { school: true },
      orderBy: { totalPoints: 'desc' }
    })

    const unreadSubmissions = await prisma.submission.findMany({
      where: { status: 'UNREAD' },
      include: { 
        user: {
          include: { school: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ students, unreadSubmissions })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
