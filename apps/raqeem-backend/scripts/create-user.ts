import 'dotenv/config'
import { auth } from '../src/lib/auth'
import { db } from '../src/db'
import * as schema from '../src/db/schema/auth'
import { organization, member } from '../src/db/schema/auth'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

/**
 * Generate a secure random password
 * @param length Password length (default: 16)
 * @returns Secure random password with uppercase, lowercase, numbers, and symbols
 */
function generateSecurePassword(length = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const all = uppercase + lowercase + numbers + symbols

  // Ensure at least one of each type
  let password = ''
  password += uppercase[crypto.randomInt(uppercase.length)]
  password += lowercase[crypto.randomInt(lowercase.length)]
  password += numbers[crypto.randomInt(numbers.length)]
  password += symbols[crypto.randomInt(symbols.length)]

  // Fill rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Generate a slug from email
 * @param email User email
 * @returns Slug for organization
 */
function generateSlug(email: string): string {
  const timestamp = Date.now().toString(36)
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + timestamp
}

/**
 * Generate a unique ID
 * @returns Unique ID string
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Create a new user for private beta
 * @param email User email
 * @param name User full name
 */
async function createUser(email: string, name: string) {
  try {
    // 1. Generate secure random password
    const tempPassword = generateSecurePassword(16)

    console.log('\n🔄 Creating user...')

    // 2. Create user with Better Auth
    const userResult = await auth.api.signUpEmail({
      body: {
        email,
        password: tempPassword,
        name,
      },
    })

    if (!userResult?.user) {
      throw new Error('Failed to create user')
    }

    const user = userResult.user

    console.log('✅ User created in auth system')

    // 2b. Update user to set passwordChangeRequired flag
    await db
      .update(schema.user)
      .set({ passwordChangeRequired: true })
      .where(eq(schema.user.id, user.id))

    console.log('✅ Password change requirement set')

    // 3. Create organization for the user
    const orgName = `${name}`
    const slug = generateSlug(email)

    const [org] = await db
      .insert(organization)
      .values({
        id: generateId(),
        name: orgName,
        slug: slug,
        createdAt: new Date(),
      })
      .returning()

    console.log('✅ Organization created')

    // 4. Add user as organization owner
    await db.insert(member).values({
      id: generateId(),
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
      createdAt: new Date(),
    })

    console.log('✅ User added as organization owner')

    // 5. Output credentials
    console.log('\n' + '━'.repeat(60))
    console.log('✅ User created successfully!')
    console.log('━'.repeat(60))
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Name: ${name}`)
    console.log(`🔑 Temporary Password: ${tempPassword}`)
    console.log(`🏢 Organization: ${orgName}`)
    console.log(`🔗 Organization Slug: ${slug}`)
    console.log('━'.repeat(60))
    console.log('⚠️  IMPORTANT:')
    console.log('   • This is a TEMPORARY password')
    console.log('   • User MUST change password on first login')
    console.log('   • Send credentials via secure channel only')
    console.log('   • Do NOT share via email or unencrypted channels')
    console.log('━'.repeat(60))
    console.log('\n📋 Template Email (Arabic):')
    console.log('━'.repeat(60))
    console.log(`
مرحباً بك في رقيم - برنامج الوصول المبكر

تم إنشاء حسابك بنجاح. إليك بيانات الدخول:

البريد الإلكتروني: ${email}
كلمة المرور المؤقتة: ${tempPassword}

⚠️ مهم جداً:
• هذه كلمة مرور مؤقتة
• سيُطلب منك تغييرها عند أول تسجيل دخول
• لا تشارك هذه المعلومات مع أي شخص

رابط الدخول: https://raqeem.tn/login

مع تحيات فريق رقيم
    `)
    console.log('━'.repeat(60))
  } catch (error) {
    console.error('\n❌ Error creating user:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.error('\n💡 Tip: This email is already registered. Try a different email.')
      }
    }
    throw error
  }
}

// Parse CLI arguments
const args = process.argv.slice(2)

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: pnpm create-user --email <email> --name "<full name>"

Options:
  --email <email>    User's email address (required)
  --name "<name>"    User's full name in quotes (required)
  --help, -h         Show this help message

Example:
  pnpm create-user --email lawyer@example.com --name "محمد الحارثي"
  `)
  process.exit(0)
}

const emailIndex = args.indexOf('--email')
const nameIndex = args.indexOf('--name')

if (emailIndex === -1 || nameIndex === -1) {
  console.error('❌ Error: Missing required arguments')
  console.error('\nUsage: pnpm create-user --email <email> --name "<full name>"')
  console.error('\nExample:')
  console.error('  pnpm create-user --email lawyer@example.com --name "محمد الحارثي"')
  console.error('\nRun "pnpm create-user --help" for more information.')
  process.exit(1)
}

const email = args[emailIndex + 1]
const name = args[nameIndex + 1]

if (!email || !name) {
  console.error('❌ Error: Email and name cannot be empty')
  console.error('\nUsage: pnpm create-user --email <email> --name "<full name>"')
  process.exit(1)
}

// Validate email format (basic)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format')
  console.error(`   Provided: ${email}`)
  process.exit(1)
}

// Run the create user function
createUser(email, name)
  .then(() => {
    console.log('\n✅ Script completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed\n')
    process.exit(1)
  })
