import axios from 'axios';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class SlackService {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}
  private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL;

  async sendMessage(message: string) {
    if (!this.webhookUrl) {
      this.logger.warn('Slack webhook URL is not configured');
      return;
    }

    try {
      await axios.post(this.webhookUrl, {
        text: message,
      });
      this.logger.log('[SlackService] Send to Slack:', message);
    } catch (error) {
      this.logger.error('[SlackService] Failed to send alert', error);
    }
  }
}
