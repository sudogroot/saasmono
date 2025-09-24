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

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4001',
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
