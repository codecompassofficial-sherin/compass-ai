import nodemailer from "nodemailer";
import type { SentMessageInfo, Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../logger/logger.js";

function createTransport(): Transporter {
  if (env.nodeEnv === "test") {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  if (env.smtpHost) {
    return nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth:
        env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    });
  }
  if (env.nodeEnv === "production") {
    throw new Error("SMTP is not configured for the production environment");
  }
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransport();
const useJsonTransport = env.nodeEnv === "test" || !env.smtpHost;

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(message: MailMessage): Promise<void> {
  const info: SentMessageInfo = await transporter.sendMail({
    from: env.smtpFrom ?? "no-reply@compass-ai.dev",
    ...message,
  });

  if (useJsonTransport) {
    logger.debug({ mail: info.message }, "Email generated (no SMTP configured)");
  } else {
    logger.info(
      { messageId: info.messageId, to: message.to, subject: message.subject },
      "Email sent",
    );
  }
}
