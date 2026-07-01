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
        Role: {
          type: 'object',
          properties: {
            id_role: { type: 'integer' },
            role_code: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            date_created: { type: 'string', format: 'date-time' },
            date_modified: { type: 'string', format: 'date-time' },
            user_created: { type: 'string', nullable: true },
            user_modified: { type: 'string', nullable: true },
          },
        },
        User: {
          type: 'object',
          properties: {
            id_user: { type: 'integer' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            avatar_url: { type: 'string', nullable: true },
            role_code: { type: 'string' },
            role: { $ref: '#/components/schemas/Role' },
            is_active: { type: 'boolean' },
            status: { type: 'string' },
            date_created: { type: 'string', format: 'date-time' },
            date_modified: { type: 'string', format: 'date-time' },
            user_created: { type: 'string', nullable: true },
            user_modified: { type: 'string', nullable: true },
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
            date_created: { type: 'string', format: 'date-time' },
            date_modified: { type: 'string', format: 'date-time' },
            user_created: { type: 'string', nullable: true },
            user_modified: { type: 'string', nullable: true },
          },
        },
        Package: {
          type: 'object',
          properties: {
            id_package:     { type: 'integer' },
            id_vendor:      { type: 'integer' },
            name:           { type: 'string' },
            description:    { type: 'string', nullable: true },
            price:          { type: 'number' },
            duration:       { type: 'string', nullable: true },
            whats_included: { type: 'string', nullable: true },
            status:         { type: 'string', enum: ['active', 'inactive'] },
            date_created:     { type: 'string', format: 'date-time' },
            date_modified:    { type: 'string', format: 'date-time' },
            user_created:     { type: 'string', nullable: true },
            user_modified:    { type: 'string', nullable: true },
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
