const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Create a default school first
  const school = await prisma.school.upsert({
    where: { name: 'المدرسة المركزية' },
    update: {},
    create: {
      name: 'المدرسة المركزية',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@green.com' },
    update: {},
    create: {
      name: 'مدير النظام',
      email: 'admin@green.com',
      password: hashedPassword,
      role: 'ADMIN',
      schoolId: school.id,
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
