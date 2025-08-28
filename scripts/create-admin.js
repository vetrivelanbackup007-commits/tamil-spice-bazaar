const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Create or update your specific admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'vetrivelanbackup007@gmail.com' },
      update: {
        role: 'ADMIN'
      },
      create: {
        email: 'vetrivelanbackup007@gmail.com',
        name: 'Vetrivelan Admin',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin user created/updated:', adminUser)
    
    // Also create the default admin user
    const defaultAdmin = await prisma.user.upsert({
      where: { email: 'admin@tamilspicebazaar.com' },
      update: {
        role: 'ADMIN'
      },
      create: {
        email: 'admin@tamilspicebazaar.com',
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Default admin user created/updated:', defaultAdmin)
    
    // Also create a test regular user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        role: 'USER'
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        emailVerified: new Date()
      }
    })

    console.log('✅ Test user created/updated:', testUser)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
