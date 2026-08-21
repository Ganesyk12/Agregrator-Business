declare module 'midtrans-client' {
  export interface MidtransConfig {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  export class Snap {
    constructor(config: MidtransConfig)
    createTransaction(parameter: any): Promise<any>
    createTransactionToken(parameter: any): Promise<string>
    createTransactionRedirectUrl(parameter: any): Promise<string>
  }

  export class CoreApi {
    constructor(config: MidtransConfig)
    charge(parameter: any): Promise<any>
    capture(parameter: any): Promise<any>
    approve(parameter: any): Promise<any>
    cancel(parameter: any): Promise<any>
    expire(parameter: any): Promise<any>
  }

  const midtransClient: {
    Snap: typeof Snap
    CoreApi: typeof CoreApi
  }

  export default midtransClient
}
