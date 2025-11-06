# Private Beta User Creation & First Login Flow - Implementation Plan

## 🎯 Objective
Create a secure system for manually creating users during private beta, with forced password change on first login, without exposing any public registration endpoints.

## 📋 Current Better Auth Setup Analysis

### Existing Configuration
- **Better Auth Version**: v1.3.12
- **Enabled Plugins**:
  - ✅ `admin()` - User management capabilities
  - ✅ `organization()` - Organization support
  - ✅ `username()` - Username support
  - ✅ `anonymous()` - Anonymous auth
  - ✅ `expo()` - Mobile support
  - ✅ `emailAndPassword` - Email/password authentication

### Database Schema
- `user` table with standard fields
- `organization` table for law firms
- `member` table linking users to organizations
- `account` table for authentication providers

## 🏗️ Architecture Design

### Option 1: CLI Script with Server API (✅ RECOMMENDED)

**Approach**: Create a standalone Node.js script that directly calls Better Auth server APIs without HTTP requests.

**Benefits**:
- ✅ No HTTP endpoints exposed
- ✅ Runs directly on server
- ✅ Access to Better Auth's internal API
- ✅ Can run via `pnpm` scripts
- ✅ Simple and secure

**Security**: Script only works when executed on server with database access.

### Option 2: Protected Admin Endpoint with Environment Variable

**Approach**: Create an admin endpoint protected by a secret environment variable.

**Benefits**:
- ✅ Can be called remotely if needed
- ✅ Protected by secret token

**Drawbacks**:
- ⚠️ HTTP endpoint exists (even if protected)
- ⚠️ More attack surface
- ⚠️ Requires HTTP security considerations

## ✅ Recommended Solution: Option 1 - CLI Script

### Implementation Components

#### 1. **User Creation Script** (`scripts/create-user.ts`)

**Purpose**: Create user with temporary password

**Features**:
- Generate secure random password
- Create user via `auth.api.createUser()`
- Create organization for the user
- Add user as organization member
- Print credentials to console (for manual sharing)

**Usage**:
```bash
pnpm create-user --email user@example.com --name "User Name"
```

**Output**:
```
✅ User created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: user@example.com
🔑 Temporary Password: AbC123XyZ!@#
⚠️  IMPORTANT: User MUST change password on first login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2. **Password Change Enforcement**

**Challenge**: Better Auth doesn't have built-in "force password change" feature.

**Solution**: Custom implementation using Better Auth's existing features:

##### A. Database Flag Approach (✅ RECOMMENDED)

Add a custom field to track first login:

**Schema Extension**:
```typescript
// In user table
passwordChangeRequired: boolean('password_change_required').default(false)
```

**Flow**:
1. Script sets `passwordChangeRequired: true` when creating user
2. After successful login, check this flag in middleware
3. If `true`, redirect to `/change-password` page
4. After password change, set flag to `false`

##### B. Implementation Steps:

**Step 1**: Extend User Schema
```typescript
// src/db/schema/auth.ts
export const user = pgTable('user', {
  // ... existing fields
  passwordChangeRequired: boolean('password_change_required').default(false),
})
```

**Step 2**: Frontend Middleware Check
```typescript
// apps/raqeem-frontend/src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession()

  if (session?.user?.passwordChangeRequired) {
    return NextResponse.redirect('/change-password')
  }
}
```

**Step 3**: Password Change Page
```typescript
// apps/raqeem-frontend/src/app/change-password/page.tsx
// Use Better Auth's changePassword() method
// After success, update user via API to set passwordChangeRequired: false
```

**Step 4**: Update User API
```typescript
// Backend: Update user after password change
await auth.api.updateUser({
  body: {
    userId: user.id,
    data: {
      passwordChangeRequired: false
    }
  }
})
```

#### 3. **Organization Creation**

Each user needs an organization:

```typescript
// Create organization for the user
const org = await db.insert(organization).values({
  id: generateId(),
  name: `${userName}'s Firm`, // or custom name
  slug: generateSlug(userName),
  createdAt: new Date(),
}).returning()

// Add user as owner/admin member
await db.insert(member).values({
  id: generateId(),
  organizationId: org[0].id,
  userId: user.id,
  role: 'owner',
  createdAt: new Date(),
})
```

## 📝 Detailed Implementation Plan

### Phase 1: Extend Database Schema

**Files to Modify**:
- `src/db/schema/auth.ts` - Add `passwordChangeRequired` field

**Migration**:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Phase 2: Create User Creation Script

**New File**: `scripts/create-user.ts`

**Dependencies**:
- `crypto` - Random password generation
- Better Auth instance
- Database connection
- `commander` or `yargs` - CLI argument parsing

**Script Structure**:
```typescript
import { auth } from '../src/lib/auth'
import { db } from '../src/db'
import { organization, member } from '../src/db/schema/auth'
import { generateId } from 'lucia' // or similar
import crypto from 'crypto'

async function createUser(email: string, name: string) {
  // 1. Generate secure random password
  const tempPassword = generateSecurePassword()

  // 2. Create user with Better Auth
  const user = await auth.api.createUser({
    body: {
      email,
      password: tempPassword,
      name,
      data: {
        passwordChangeRequired: true // Custom field
      }
    }
  })

  // 3. Create organization
  const orgName = `${name}'s Law Firm`
  const [org] = await db.insert(organization).values({
    id: generateId(),
    name: orgName,
    slug: generateSlug(email),
    createdAt: new Date()
  }).returning()

  // 4. Add user as organization owner
  await db.insert(member).values({
    id: generateId(),
    organizationId: org.id,
    userId: user.id,
    role: 'owner',
    createdAt: new Date()
  })

  // 5. Output credentials
  console.log('\n✅ User created successfully!')
  console.log('━'.repeat(50))
  console.log(`📧 Email: ${email}`)
  console.log(`👤 Name: ${name}`)
  console.log(`🔑 Temporary Password: ${tempPassword}`)
  console.log(`🏢 Organization: ${orgName}`)
  console.log('⚠️  IMPORTANT: User MUST change password on first login')
  console.log('━'.repeat(50))
}

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

  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

function generateSlug(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
}

// Parse CLI arguments
const args = process.argv.slice(2)
const emailIndex = args.indexOf('--email')
const nameIndex = args.indexOf('--name')

if (emailIndex === -1 || nameIndex === -1) {
  console.error('Usage: pnpm create-user --email user@example.com --name "User Name"')
  process.exit(1)
}

const email = args[emailIndex + 1]
const name = args[nameIndex + 1]

createUser(email, name)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error creating user:', error)
    process.exit(1)
  })
```

### Phase 3: Frontend Password Change Flow

**New Files**:
1. `apps/raqeem-frontend/src/app/change-password/page.tsx` - Password change UI
2. `apps/raqeem-frontend/src/middleware.ts` - Check for required password change

**Password Change Page**:
```typescript
'use client'

import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    try {
      // Use Better Auth's changePassword
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      })

      // Update passwordChangeRequired flag
      await fetch('/api/user/complete-password-change', {
        method: 'POST',
        credentials: 'include'
      })

      toast.success('تم تغيير كلمة المرور بنجاح')
      router.push('/dashboard')
    } catch (error) {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
    }
  }

  return (
    // ... UI implementation
  )
}
```

**Middleware Check**:
```typescript
// apps/raqeem-frontend/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get session from Better Auth
  const session = await getSession(request)

  // If user is authenticated and password change is required
  if (session?.user?.passwordChangeRequired) {
    // Don't redirect if already on change password page
    if (!request.nextUrl.pathname.startsWith('/change-password')) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### Phase 4: Backend API for Password Change Completion

**New File**: `src/routers/user.ts`

```typescript
import { protectedProcedure } from '../lib/orpc'
import { db } from '../db'
import { user } from '../db/schema/auth'
import { eq } from 'drizzle-orm'

export const userRouter = {
  completePasswordChange: protectedProcedure
    .route({
      method: 'POST',
      path: '/user/complete-password-change',
      tags: ['User'],
      summary: 'Mark password change as completed',
    })
    .handler(async ({ context }) => {
      const userId = context.session?.user?.id

      if (!userId) {
        throw new Error('Unauthorized')
      }

      // Update passwordChangeRequired to false
      await db
        .update(user)
        .set({ passwordChangeRequired: false })
        .where(eq(user.id, userId))

      return { success: true }
    }),
}
```

### Phase 5: Add Script to package.json

```json
{
  "scripts": {
    "create-user": "tsx scripts/create-user.ts"
  }
}
```

## 🔒 Security Considerations

### ✅ Secure Aspects

1. **No Public Endpoint**: Script runs server-side only
2. **Database Access Required**: Can't run without proper credentials
3. **Secure Password Generation**: Cryptographically secure random passwords
4. **Forced Password Change**: Users must change password immediately
5. **Session Revocation**: Other sessions revoked on password change

### ⚠️ Important Notes

1. **Credential Transmission**: Send temporary passwords via secure channel (encrypted email, secure messaging)
2. **Script Access**: Limit script execution to authorized admins only
3. **Password Complexity**: Enforce strong password requirements on change
4. **Audit Logging**: Consider logging user creation events

## 📊 Testing Plan

### Manual Testing Steps

1. **Create User**:
   ```bash
   pnpm create-user --email test@example.com --name "Test User"
   ```

2. **Verify Database**:
   - User created with `passwordChangeRequired: true`
   - Organization created
   - User is organization member

3. **Login with Temporary Password**:
   - Should succeed

4. **Verify Redirect**:
   - Should redirect to `/change-password`
   - Cannot access dashboard

5. **Change Password**:
   - Submit new password
   - Verify `passwordChangeRequired` set to `false`

6. **Access Dashboard**:
   - Should now have normal access

## 🚀 Deployment Steps

1. **Database Migration**:
   ```bash
   cd apps/raqeem-backend
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

2. **Build Backend**:
   ```bash
   pnpm build
   ```

3. **Create First User**:
   ```bash
   pnpm create-user --email admin@raqeem.tn --name "Admin User"
   ```

4. **Share Credentials Securely**

## 📚 Usage Documentation

### For Admins

**Creating a New Beta User**:

```bash
# SSH into production server
ssh user@server

# Navigate to backend directory
cd /path/to/apps/raqeem-backend

# Run create user script
pnpm create-user --email lawyer@example.com --name "محمد الحارثي"

# Copy the output credentials
# Send to user via secure channel (Signal, encrypted email, etc.)
```

**Template Email to User**:

```
مرحباً بك في رقيم - برنامج الوصول المبكر

تم إنشاء حسابك بنجاح. إليك بيانات الدخول:

البريد الإلكتروني: [EMAIL]
كلمة المرور المؤقتة: [TEMP_PASSWORD]

⚠️ مهم جداً:
- هذه كلمة مرور مؤقتة
- سيُطلب منك تغييرها عند أول تسجيل دخول
- لا تشارك هذه المعلومات مع أي شخص

رابط الدخول: https://raqeem.tn/login

مع تحيات فريق رقيم
```

## 🔄 Alternative: Invitation System (Future Enhancement)

For future consideration, Better Auth supports invitation system:

1. Create invitation with `auth.api.createInvitation()`
2. Send invitation link to user
3. User sets password during invitation acceptance

This would be more user-friendly but requires:
- Email service configuration
- Invitation UI
- More complex implementation

Current approach is simpler for private beta.

## ✅ Summary

**Recommended Approach**: CLI Script with Custom Password Change Enforcement

**Key Components**:
1. ✅ CLI script for user creation (server-side only)
2. ✅ Custom `passwordChangeRequired` database field
3. ✅ Frontend middleware for redirect enforcement
4. ✅ Password change page using Better Auth's `changePassword()`
5. ✅ Backend API to mark password change complete

**Timeline**: ~4-6 hours implementation

**Security Level**: ✅ High (no public endpoints, server-side only)

**Maintenance**: ✅ Low (simple script, standard Better Auth flows)
