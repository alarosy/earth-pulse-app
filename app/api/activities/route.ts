import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import path from 'path'
import fs from 'fs-extra'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch activities' }, { status: 500 })
  }
}

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File | null

    if (!title || !description) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    let imageUrl = null

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Data = buffer.toString('base64')
      const fileUri = `data:${file.type};base64,${base64Data}`

      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'earth-pulse/activities',
      })
      imageUrl = uploadResponse.secure_url
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        imageUrl
      }
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Activity upload error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File | null

    if (!id || !title || !description) return NextResponse.json({ message: 'Missing fields' }, { status: 400 })

    let imageUrl = undefined

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Data = buffer.toString('base64')
      const fileUri = `data:${file.type};base64,${base64Data}`

      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: 'earth-pulse/activities',
      })
      imageUrl = uploadResponse.secure_url
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: { title, description, ...(imageUrl && { imageUrl }) }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await request.json()
    await prisma.activity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
