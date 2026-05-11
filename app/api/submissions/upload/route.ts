import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import path from 'path'
import fs from 'fs-extra'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file || !description) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    await fs.ensureDir(uploadDir)
    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    const imageUrl = `/uploads/${filename}`

    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        imageUrl,
        description,
        status: 'UNREAD'
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
