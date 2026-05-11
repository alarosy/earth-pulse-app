import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { name, email, password, schoolId } = await request.json()

    if (!name || !email || !password || !schoolId) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        schoolId,
        role: 'STUDENT',
        totalPoints: 0
      }
    })

    return NextResponse.json({ message: 'تم التسجيل بنجاح' }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
