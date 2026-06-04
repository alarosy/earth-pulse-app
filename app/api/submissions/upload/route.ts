import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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

    const base64Data = buffer.toString('base64')
    const fileUri = `data:${file.type};base64,${base64Data}`

    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'earth-pulse/submissions',
    })

    const imageUrl = uploadResponse.secure_url

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
