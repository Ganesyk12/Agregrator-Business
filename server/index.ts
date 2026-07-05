import path from 'path'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './middleware/error-handler'

import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/users.routes'
import userRoleRoutes from './modules/user-roles/user-roles.routes'
import vendorRoutes from './modules/vendors/vendors.routes'
import packageRoutes from './modules/packages/packages.routes'
import roleRoutes from './modules/roles/roles.routes'
import locationRoutes from './modules/locations/locations.routes'
import bookingRoutes from './modules/bookings/bookings.routes'
import categoryRoutes from './modules/categories/categories.routes'
import portfolioRoutes from './modules/portfolios/portfolios.routes'
import uploadRoutes from './modules/upload/upload.routes'

const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

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
app.use('/api/user-roles', userRoleRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/portfolios', portfolioRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`)
  console.log(`Environment: ${env.nodeEnv}`)
})

export default app
