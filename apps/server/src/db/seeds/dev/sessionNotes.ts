import { config } from 'dotenv'
import { and, eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as authSchema from '../../schema/auth'
import * as classroomSchema from '../../schema/classroom'
import * as sessionNoteSchema from '../../schema/sessionNote'
import * as timetableSchema from '../../schema/timetable'

config()
const { Pool } = pkg

// Sample session note content templates (Cornell notes style)
const NOTE_TEMPLATES = [
  {
    titleSuffix: 'مقدمة وأساسيات',
    keywords: 'مقدمة, أساسيات, تعريف, مفاهيم',
    cues: [
      'ما هي المفاهيم الأساسية؟',
      'ما هي التعاريف المهمة؟',
      'ما هي الأهداف الرئيسية؟'
    ],
    notesContent: 'تم تقديم المفاهيم الأساسية للدرس بشكل تفصيلي. بدأنا بتعريف المصطلحات الرئيسية وشرح العلاقة بينها. ناقشنا الأهداف التعليمية المتوقعة من هذا الدرس وكيفية تطبيقها في الحياة اليومية.',
    summary: 'تم التركيز على فهم المفاهيم الأساسية وإرساء قاعدة صلبة للدروس القادمة. الطلاب أظهروا تفاعلاً جيداً مع الأمثلة المطروحة.',
    isPrivate: false,
  },
  {
    titleSuffix: 'التطبيقات العملية',
    keywords: 'تطبيقات, أمثلة, تمارين, حلول',
    cues: [
      'كيف نطبق النظرية عملياً؟',
      'ما هي الأمثلة الواقعية؟',
      'كيف نحل المشكلات؟'
    ],
    notesContent: 'عملنا على تطبيق المفاهيم النظرية من خلال أمثلة عملية متنوعة. قام الطلاب بحل تمارين تطبيقية بشكل فردي وجماعي. تم تصحيح الأخطاء الشائعة وتقديم استراتيجيات فعالة للحل.',
    summary: 'الطلاب اكتسبوا مهارات عملية في تطبيق المفاهيم. بعض الطلاب يحتاجون إلى دعم إضافي في بعض التمارين المعقدة.',
    isPrivate: false,
  },
  {
    titleSuffix: 'مراجعة وتقييم',
    keywords: 'مراجعة, تقييم, أسئلة, اختبار',
    cues: [
      'ما هي النقاط الرئيسية؟',
      'ما الذي تعلمناه اليوم؟',
      'كيف يمكن التحسين؟'
    ],
    notesContent: 'أجرينا مراجعة شاملة للمواضيع التي تم تناولها في الحصص السابقة. تم طرح أسئلة تقييمية لقياس مستوى الفهم. ناقشنا النقاط التي تحتاج إلى تعزيز إضافي.',
    summary: 'المراجعة كشفت عن فهم جيد للمفاهيم الأساسية. سنخصص وقتاً إضافياً لبعض المواضيع في الحصة القادمة.',
    isPrivate: false,
  },
  {
    titleSuffix: 'ملاحظات سلوكية',
    keywords: 'سلوك, انضباط, تفاعل, مشاركة',
    cues: [
      'كيف كان سلوك الطلاب؟',
      'من شارك بفعالية؟',
      'ما هي التحديات السلوكية؟'
    ],
    notesContent: 'لاحظت مستوى جيداً من الانضباط والتفاعل. بعض الطلاب تميزوا بمشاركتهم الفعالة. هناك حاجة لتحسين الانتباه في بعض الحالات.',
    summary: 'بشكل عام، الجو العام للحصة كان إيجابياً ومحفزاً للتعلم. سأعمل على تشجيع المشاركة من جميع الطلاب.',
    isPrivate: true, // Private note for teacher only
  },
  {
    titleSuffix: 'نشاط جماعي',
    keywords: 'نشاط, جماعي, تعاون, مشروع',
    cues: [
      'ما هو النشاط الجماعي؟',
      'كيف عمل الطلاب معاً؟',
      'ما هي النتائج؟'
    ],
    notesContent: 'قام الطلاب بتنفيذ نشاط جماعي يتطلب التعاون وتقسيم الأدوار. كل مجموعة قدمت عملها وشرحت منهجيتها. كانت النتائج متنوعة ومثيرة للاهتمام.',
    summary: 'الأنشطة الجماعية تعزز روح التعاون والتعلم النشط. الطلاب استمتعوا بالنشاط وأظهروا إبداعاً في الحلول.',
    isPrivate: false,
  },
]

async function seedSessionNotes(orgId: string) {
  console.log(`📝 Starting session notes seed for organization: ${orgId}\n`)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool, {
    schema: {
      ...sessionNoteSchema,
      ...timetableSchema,
      ...classroomSchema,
      ...authSchema,
    }
  })

  try {
    // Check if organization exists
    console.log('🔍 Checking organization...')
    const organizations = await db
      .select()
      .from(authSchema.organization)
      .where(eq(authSchema.organization.id, orgId))

    if (organizations.length === 0) {
      throw new Error(`Organization with ID "${orgId}" not found.`)
    }

    console.log('✅ Organization found')

    // Check if session notes already exist
    console.log('🔍 Checking existing session notes...')
    const existingNotes = await db
      .select()
      .from(sessionNoteSchema.sessionNote)
      .where(
        and(
          eq(sessionNoteSchema.sessionNote.orgId, orgId),
          isNull(sessionNoteSchema.sessionNote.deletedAt)
        )
      )

    if (existingNotes.length > 0) {
      console.log(`⚠️  Found ${existingNotes.length} existing session notes for organization ${orgId}`)
      console.log('Skipping session notes seed to avoid duplicates.')
      return { notes: [], message: 'Session notes already exist' }
    }

    // Get timetables
    console.log('📅 Fetching timetables...')
    const timetables = await db
      .select({
        id: timetableSchema.timetable.id,
        title: timetableSchema.timetable.title,
        startDateTime: timetableSchema.timetable.startDateTime,
        endDateTime: timetableSchema.timetable.endDateTime,
        teacherId: timetableSchema.timetable.teacherId,
        classroomId: timetableSchema.timetable.classroomId,
      })
      .from(timetableSchema.timetable)
      .where(
        and(
          eq(timetableSchema.timetable.orgId, orgId),
          isNull(timetableSchema.timetable.deletedAt)
        )
      )

    if (timetables.length === 0) {
      throw new Error(`No timetables found for organization ${orgId}. Please run timetables seed first.`)
    }

    console.log(`✅ Found ${timetables.length} timetables`)

    // Create session notes
    console.log('📝 Creating session notes...')
    const createdNotes = []

    // Create notes for a subset of timetables (60% coverage)
    const timetablesToUse = timetables
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.ceil(timetables.length * 0.6))

    for (const timetable of timetablesToUse) {
      // Pick a random template
      const template = NOTE_TEMPLATES[Math.floor(Math.random() * NOTE_TEMPLATES.length)]!

      // Generate notes in Tiptap JSON format
      const notesInTiptap = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '📋 الملاحظات الرئيسية',
                marks: [{ type: 'bold' }]
              }
            ]
          },
          {
            type: 'paragraph',
            content: []
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: template.notesContent
              }
            ]
          },
          {
            type: 'paragraph',
            content: []
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '🔑 الكلمات المفتاحية',
                marks: [{ type: 'bold' }]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: template.keywords
              }
            ]
          }
        ]
      }

      // Generate cues section (Cornell left column)
      const cuesText = template.cues.join('\n\n')

      try {
        const [note] = await db
          .insert(sessionNoteSchema.sessionNote)
          .values({
            title: `${timetable.title} - ${template.titleSuffix}`,
            content: template.notesContent, // Plain text content
            keywords: template.keywords,
            notes: JSON.stringify(notesInTiptap), // Tiptap JSON format
            summary: template.summary,
            isPrivate: template.isPrivate,
            timetableId: timetable.id,
            orgId,
            createdByUserId: timetable.teacherId!,
          })
          .returning()

        if (!note) throw new Error(`Failed to create session note`)
        createdNotes.push(note)

        const privacyLabel = template.isPrivate ? '🔒 خاصة' : '👁️ عامة'
        console.log(`  ✅ ${privacyLabel} - ${note.title}`)

      } catch (error) {
        if ((error as Error).message?.includes('duplicate') || (error as Error).message?.includes('unique')) {
          console.log(`    ⚠️  Skipping duplicate note for timetable: ${timetable.title}`)
          continue
        }
        throw error
      }
    }

    console.log('\n🎉 Session notes seed completed successfully!')
    console.log(`📊 Summary for organization ${orgId}:`)
    console.log(`  - ${createdNotes.length} session notes created`)
    console.log(`  - ${timetables.length} total timetables available`)
    console.log(`  - ${Math.ceil((createdNotes.length / timetables.length) * 100)}% timetables coverage`)

    // Show privacy distribution
    const publicNotes = createdNotes.filter(n => !n.isPrivate).length
    const privateNotes = createdNotes.filter(n => n.isPrivate).length

    console.log('\n📊 Privacy distribution:')
    console.log(`  - Public notes: ${publicNotes}`)
    console.log(`  - Private notes: ${privateNotes}`)

    return {
      notes: createdNotes,
      summary: {
        total: createdNotes.length,
        timetables: timetables.length,
        coverage: Math.ceil((createdNotes.length / timetables.length) * 100),
        publicNotes,
        privateNotes,
      }
    }

  } catch (error) {
    console.error('❌ Session notes seed failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2]

if (!orgId) {
  console.error('❌ Organization ID is required!')
  console.error('Usage: pnpm run seed:session-notes <orgId>')
  console.error('Example: pnpm run seed:session-notes org_default_school')
  process.exit(1)
}

// Run the seed
seedSessionNotes(orgId).catch((error) => {
  console.error('❌ Session notes seed process failed:', error)
  process.exit(1)
})
