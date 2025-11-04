import { OpenAPIHandler } from '@orpc/openapi/node'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/node'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { auth } from './lib/auth'
import { createContext } from './lib/context'
import { appRouter } from './routers'

const app = express()

// Parse CORS_ORIGIN to support multiple origins (comma-separated)
const getAllowedOrigins = (): string[] => {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4001'
  return corsOrigin.split(',').map((origin) => origin.trim())
}

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins()
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  })
)

app.all('/api/auth{/*path}', toNodeHandler(auth))

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

app.use(async (req, res, next) => {
  const rpcResult = await rpcHandler.handle(req, res, {
    prefix: '/rpc',
    context: await createContext({ req }),
  })
  if (rpcResult.matched) return

  const apiResult = await apiHandler.handle(req, res, {
    prefix: '/api',
    context: await createContext({ req }),
  })
  if (apiResult.matched) return

  next()
})

app.use(express.json())

app.get('/', (_req, res) => {
  res.status(200).send('OK')
})

export default app
