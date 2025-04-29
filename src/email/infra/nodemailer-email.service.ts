import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { Inject, Injectable } from '@nestjs/common';
import emailConfig from '@/core/common/config/emailConfig';
import { ConfigType } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NodemailerEmailService {
  private transporter: Mail;

  constructor(
    @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  // async verifyEmail(emailAddress: string, signupVerifyToken: string) {
  //     const baseUrl = 'http://localhost:3000';
  //     const url = `${baseUrl}/auth/email/verify?signupVerifyToken=${signupVerifyToken}`;

  //     const mailOptions: EmailOptions = {
  //         to: emailAddress,
  //         subject: '✨가입 인증 메일✨',
  //         html: `
  //         가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
  //         <form action="${url}" method="POST">
  //             <button>가입확인</button>
  //         </form>
  //         `
  //     }
  // }

  async sendResetPasswordEmail(email: string, url: string) {
    console.log();
    const mailOptions: EmailOptions = {
      to: email,
      subject: '🔐 비밀번호 재설정 안내',
      html: `
          아래 버튼을 클릭하면 비밀번호를 재설정할 수 있습니다.<br/>
          <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
            비밀번호 재설정
          </a>
          <p>해당 링크는 30분 후 만료됩니다.</p>
        `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendMemberJoinVerification(
    emailAddress: string,
    signupVerifyToken: string,
  ) {
    console.log('sendMemberJoinVerification()');
    const baseUrl = 'http://localhost:3000';

    const url = `${baseUrl}/users/email/auth/verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '✨가입 인증 메일✨',
      html: `
            가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
            <form action="${url}" method="POST">
                <button>가입확인</button>
            </form>
            `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendSecurityAlertEmail(
    to: string,
    userName: string,
    suspiciousIp: string,
  ) {
    const mailOptions = {
      to,
      subject: '🔒 보안 경고: 의심스러운 IP 접근 감지',
      html: `
            <h3>${userName}님, 안녕하세요.</h3>
            <p>새로운 IP 주소에서 로그인 시도가 감지되었습니다:</p>
            <p><strong>IP 주소:</strong> ${suspiciousIp}</p>
            <br/>
            <p>만약 본인이 시도한 것이 아니라면 즉시 비밀번호를 변경해주시고, 계정을 보호해주세요.</p>
            <br/>
            <p>항상 저희 서비스를 이용해 주셔서 감사합니다.</p>
            <br/>
            <p>- 유저 서비스 보안팀</p>
          `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
