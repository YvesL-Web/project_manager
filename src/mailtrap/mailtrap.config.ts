// Looking to send emails in production? Check out our Email API/SMTP product!
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

export const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
