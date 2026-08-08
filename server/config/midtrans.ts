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
