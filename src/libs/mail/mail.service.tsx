import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { ConfirmationTemplate } from './templates/confirmation.template';
import React from 'react';
@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow('RESEND_API_KEY'));
    this.fromEmail = this.configService.getOrThrow('RESEND_EMAIL_FROM');
  }

  public async sendConfirmationEmail(email: string, token: string) {
    const domain = this.configService.getOrThrow('ALLOWED_ORIGIN');
    const html = await render(
      <ConfirmationTemplate domain={domain} token={token} />
    );

    return this.sendEmail(email, 'Confirm your email', html);
  }

  private sendEmail(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }
}
