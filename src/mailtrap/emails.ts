// import '../config/logging';
import { transport } from './mailtrap.config';
import { PASSWORD_RESET_REQUEST_TEMPLATE } from './templates/passwordResetRequestTemplate';
import { PASSWORD_RESET_SUCCESS_TEMPLATE } from './templates/passwordResetSuccessTemplate';
import { VERIFICATION_EMAIL_TEMPLATE } from './templates/verificationEmailTemplate';
import { WELCOME_TEMPLATE } from './templates/welcomeTemplate';

const sender = process.env.FROM || '';

// export const sendVerificationEmail = async (email: string, verificationToken: string) => {
//   const recipient = [email];
//   // send mail with defined transport object
//   try {
//     await transport.sendMail({
//       from: sender,
//       to: recipient,
//       subject: 'Verify your email',
//       html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationToken}', verificationToken)
//     });
//     logging.info('verification_email sent to:', email);
//   } catch (error: any) {
//     logging.error('Error sending verification_email:', error);
//   }
// };

// export const sendWelcomeEmail = async (email: string, name: string) => {
//   // Création de l'objet variables avec les paramètres
//   const variables = {
//     name: name,
//     email: email
//   };
//   const recipient = [email];

//   // send mail with defined transport object
//   try {
//     await transport.sendMail({
//       from: sender,
//       to: recipient,
//       subject: 'Welcome',
//       html: WELCOME_TEMPLATE.replace(/{(\w+)}/g, (match, key) => variables[key as keyof typeof variables] || match)
//     });
//     logging.info('welcome_email sent to:', email);
//   } catch (error: any) {
//     logging.error('Error sending welcome_email:', error);
//   }
// };

export const sendPasswordResetEmail = async (username: string, email: string, resetLink: string) => {
  const recipient = [email];
  const variables = {
    username: username,
    email: email,
    resetLink: resetLink
  };
  try {
    await transport.sendMail({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(/{(\w+)}/g, (match, key) => variables[key as keyof typeof variables] || match)
    });
    console.info('password_reset_request_email sent to:', email);
    return true;
  } catch (error: any) {
    console.error('Error sending password_reset_request_email:', error);
    return false;
  }
};

// export const sentResetSuccessEmail = async (email: string) => {
//   const recipient = [email];
//   try {
//     await transport.sendMail({
//       from: sender,
//       to: recipient,
//       subject: 'Reset your password',
//       html: PASSWORD_RESET_SUCCESS_TEMPLATE
//     });
//     logging.info('password_reset_success_email sent to:', email);
//   } catch (error) {
//     logging.error('Error sending password_reset_success_email:', error);
//   }
// };

export const sendMail = async (to: string, subject: string, body: string) => {
  try {
    const status = await transport.sendMail({
      from: sender,
      to: to,
      subject: subject,
      html: body
    });
    if (status?.messageId) {
      return status.messageId;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`Error while sendEmail => ${error.message}`);
    return false;
  }
};
