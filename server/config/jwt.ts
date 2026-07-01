import jwt from 'jsonwebtoken'
import { env } from './env'

export interface JwtPayload {
  id_user: number
  email: string
  full_name: string
  role_code: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload
}
