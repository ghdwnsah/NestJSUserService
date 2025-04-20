import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { Inject, Injectable } from '@nestjs/common';
import emailConfig from '@/core/common/config/emailConfig';
import { ConfigType } from '@nestjs/config';

interface EmailOptions {
    to: string,
    subject: string,
    html: string,
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
            }
        })
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

    async sendMemberJoinVerification(emailAddress: string, signupVerifyToken: string) {
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
            `
        }

        return await this.transporter.sendMail(mailOptions);
    }

}
