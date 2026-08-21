/// <reference path="../types/midtrans-client.d.ts" />
import midtransClient from 'midtrans-client'
import { env } from './env'

const serverKey = env.midtransServerKey
const clientKey = env.midtransClientKey
const isProduction = env.midtransIsProduction

if (!serverKey || !clientKey) {
  console.warn('⚠️ Warning: Midtrans Server Key or Client Key is missing in env. Midtrans integration will not function properly.')
}

// Initialize Snap client for handle checkout transactions (generates Snap token/redirect URL)
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
})

// Initialize CoreApi client for direct payments (credit cards, direct bank transfer, e-wallets, etc.)
export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
})

const MIDTRANS_TIMEOUT_MS = 15_000

export function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Midtrans API timeout after ${MIDTRANS_TIMEOUT_MS / 1000}s: ${label}`)), MIDTRANS_TIMEOUT_MS),
    ),
  ])
}
