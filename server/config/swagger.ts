import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sigyn API',
      version: '1.0.0',
      description: 'Platform Agregrator Jasa — MUA / Fotografer / WO',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id_user: { type: 'integer' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            avatar_url: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['customer', 'vendor', 'admin'] },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Vendor: {
          type: 'object',
          properties: {
            id_vendor: { type: 'integer' },
            id_user: { type: 'integer' },
            business_name: { type: 'string' },
            description: { type: 'string', nullable: true },
            category: { type: 'string', enum: ['mua', 'fotografer', 'wo'] },
            location: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            verified_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./server/modules/**/*.routes.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
