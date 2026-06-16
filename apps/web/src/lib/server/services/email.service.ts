import { Resend } from 'resend';

import { getEmailConfig } from '../config';

let resend: Resend | null = null;

function getResend(): Resend | null {
  const { apiKey, isConfigured } = getEmailConfig();
  if (!isConfigured || !apiKey) return null;
  resend ??= new Resend(apiKey);
  return resend;
}

export function isEmailConfigured(): boolean {
  return getEmailConfig().isConfigured;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<void> {
  const client = getResend();
  const { from } = getEmailConfig();
  if (!client || !from) return;

  const { error } = await client.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
    attachments: params.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }
}
