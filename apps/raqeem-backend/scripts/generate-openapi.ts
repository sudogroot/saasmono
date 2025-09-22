import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { appRouter } from '../src/routers'

async function generateOpenAPI() {
  try {
    console.log('🔄 Generating OpenAPI specification...')

    // const generator = new OpenAPIGenerator({
    //   schemaConverters: [
    //     new ZodToJsonSchemaConverter()
    //   ]
    // })

    // const spec = await generator.generate(router, {
    //   info: {
    //     title: 'Planet API',
    //     version: '1.0.0'
    //   }
    // })

    // console.log(JSON.stringify(spec, null, 2))
    const openAPIGenerator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    })

    const spec = await openAPIGenerator.generate(appRouter, {
      info: {
        title: 'Manarah School Management API',
        version: '1.0.0',
        description:
          'REST API for managing school operations including user management, education levels, and assignments',
        contact: {
          name: 'API Support',
          email: 'support@manarah.app',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.manarah.app',
          description: 'Production server',
        },
      ],
      tags: [
        {
          name: 'User Management',
          description:
            'Complete user management operations including CRUD operations, parent-student relationships, and teacher assignments within organization scope',
        },
        {
          name: 'Health',
          description: 'Health check and system status monitoring endpoints',
        },
        {
          name: 'Authentication',
          description: 'User authentication and session management endpoints',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for authentication',
          },
          SessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'session',
            description: 'Session-based authentication',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
        {
          SessionAuth: [],
        },
      ],
    })

    const outputPath = join(process.cwd(), 'docs', 'openapi.json')

    writeFileSync(outputPath, JSON.stringify(spec, null, 2))

    console.log('✅ OpenAPI specification generated successfully!')
    console.log(`📄 Specification saved to: ${outputPath}`)
    console.log('🚀 To view the documentation, run: pnpm docs:serve')
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error)
    process.exit(1)
  }
}

generateOpenAPI()
