import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './middleware/error-handler'

import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/users.routes'
import vendorRoutes from './modules/vendors/vendors.routes'
import packageRoutes from './modules/packages/packages.routes'

const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sigyn API Docs',
}))

app.get('/api-docs.json', (_req, res) => { res.json(swaggerSpec) })

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/packages', packageRoutes)

app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`)
  console.log(`Environment: ${env.nodeEnv}`)
})

export default app
