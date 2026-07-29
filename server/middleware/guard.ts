import type { Request, Response, NextFunction } from 'express'
import { createError } from './error-handler'
import fs from 'fs'
import path from 'path'

const guardPath = path.resolve(process.cwd(), 'server', 'config', 'guard.json')

function readGuard(): GuardConfig {
  return JSON.parse(fs.readFileSync(guardPath, 'utf-8'))
}

export interface GuardConfig {
  deploy_at: string
  activate_period: number
  activated_at: string | null
  user_activate: number | null
}

const bypassPaths = ['/api/guard', '/api/health', '/api-docs']

export function guard(req: Request, _res: Response, next: NextFunction) {
  const requestPath = req.path

  if (bypassPaths.some(p => requestPath.startsWith(p))) {
    return next()
  }

  const cfg = readGuard()

  if (cfg.activated_at) {
    return next()
  }

  const deploy = new Date(cfg.deploy_at)
  const now = new Date()
  const trialEnd = new Date(deploy.getTime() + cfg.activate_period * 24 * 60 * 60 * 1000)

  if (now > trialEnd) {
    return next(createError(403, 'Trial period has ended. Please activate the system.'))
  }

  next()
}
