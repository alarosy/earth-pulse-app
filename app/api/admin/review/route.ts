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
    const { submissionId, score, adminComment } = await request.json()

    if (typeof score !== 'number' || score < 1 || score > 10) {
      return NextResponse.json({ message: 'التقييم يجب أن يكون بين 1 و 10' }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 })
    }

    // Update submission and user points in a transaction
    await prisma.$transaction([
      prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'READ',
          adminScore: score,
          adminComment: adminComment || null
        }
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data: {
          totalPoints: {
            increment: score
          }
        }
      })
    ])

    return NextResponse.json({ message: 'Success' })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
