export interface SmtpSetting {
  id_smtp: number
  host: string
  port: number
  secure: boolean
  username: string
  password?: string
  from_name: string | null
  from_email: string | null
  is_active: boolean
  date_created: Date
  date_modified: Date
  user_created?: string | null
  user_modified?: string | null
}

export interface SmtpSettingResponse {
  id_smtp: number
  host: string
  port: number
  secure: boolean
  username: string
  has_password: boolean
  from_name: string | null
  from_email: string | null
  is_active: boolean
  date_created: Date
  date_modified: Date
  is_dev_mode?: boolean
  dev_target_emails?: string[]
}

export interface UpdateSmtpInput {
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  from_name?: string
  from_email?: string
  is_active?: boolean
  user_modified?: string
}

export interface TestSmtpInput {
  target_email: string
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  from_name?: string
  from_email?: string
}

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}
