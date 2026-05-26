import { logger } from "@repo/logger";
import { env } from "../env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export class EmailService {
  private get fromAddress() {
    return env.EMAIL_FROM || "QuestForm <onboarding@resend.dev>";
  }

  private get isConfigured() {
    return Boolean(env.RESEND_API_KEY);
  }

  async sendEmail(payload: EmailPayload) {
    if (!this.isConfigured) {
      logger.debug("Skipping email because provider is not configured", {
        to: payload.to,
        subject: payload.subject,
      });
      return { skipped: true as const };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: [payload.to],
        reply_to: env.EMAIL_REPLY_TO || undefined,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("Email send failed", {
        to: payload.to,
        subject: payload.subject,
        status: response.status,
        body,
      });
      throw new Error("Email send failed");
    }

    return { skipped: false as const };
  }
}

export default EmailService;
