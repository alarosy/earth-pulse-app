import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name } = await request.json()
    const school = await prisma.school.create({
      data: { name }
    })
    return NextResponse.json(school)
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
