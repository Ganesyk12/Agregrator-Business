import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { verifyToken, type JwtPayload } from '../config/jwt'
import { createError } from './error-handler'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw createError(401, 'Missing or invalid authorization header')
    }

    const token = header.split(' ')[1]
    const payload = verifyToken(token)
    req.user = payload
    next()
  } catch (err: any) {
    if (err?.status) return next(err)
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.NotBeforeError) {
      return next(createError(401, 'Session expired. Please sign in again.'))
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(createError(401, 'Invalid authentication token'))
    }
    next(err)
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1]
      const payload = verifyToken(token)
      req.user = payload
    }
    next()
  } catch (err) {
    next()
  }
}

export function authorize(...roleCodes: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError(401, 'Not authenticated'))
    }

    if (roleCodes.length > 0 && !roleCodes.some(r => req.user!.role_codes.includes(r))) {
      return next(createError(403, 'Forbidden'))
    }

    next()
  }
}
