// export class QueueWorker {
//   private static emailQueue = new Queue('emailQueue', { redis: { port: 6379, host: '127.0.0.1', db: 2 } });
//   constructor() {
//     console.log('Initializing QueueWorker');
//   }
//   public begingProcessing() {
//     QueueWorker.emailQueue.process(async (job) => {
//       try {
//         const { to, subject, body } = job.data;
//         const responseEmail = await sendMail(to, subject, body);
//         if (!responseEmail) {
//           //handle error
//         }
//         console.log(`Email sent to ${to}`);
//       } catch (error) {
//         // handle error
//         console.log(`Failed to send email: ${error.message}`);
//       }
//     });
//   }
// }

// export class QueueWorker {
//   private static emailQueue = new Queue('emailQueue', {
//     redis: { port: 6379, host: '127.0.0.1', db: 2 }
//   });
//   private static MAX_ATTEMPTS = 4;

//   constructor() {
//     console.log('QueueWorker initialized');
//     this.beginProcessing();
//   }

//   private beginProcessing() {
//     QueueWorker.emailQueue.process(async (job) => {
//       const { to, subject, body } = job.data;
//       try {
//         const responseEmail = await sendMail(to, subject, body);
//         if (!responseEmail) {
//           console.error(`Failed to send email to ${to}: No response from mail service.`);
//           return Promise.reject(new Error('No response from mail service'));
//         }
//         console.log(`Email sent to ${to}`);
//         return Promise.resolve();
//       } catch (error: any) {
//         console.error(`Failed to send email to ${to}: ${error.message}`);
//         return Promise.reject(error);
//       }
//     });

//     QueueWorker.emailQueue.on('failed', async (job, err) => {
//       if (job.attemptsMade >= QueueWorker.MAX_ATTEMPTS) {
//         // handle the final failure
//         console.error(`Job permanently failed for ${job.data.to}: ${err.message}`);
//       } else {
//         // retry the job
//         console.log(`Retry job for job for ${job.data.to}`);
//         await job.retry();
//       }
//     });

//     QueueWorker.emailQueue.on('completed', (job) => {
//       console.log(`Job ${job.id} completed successfully.`);
//     });
//   }
// }

// export class QueueWorker {
//   private static readonly emailQueue = new Queue('emailQueue', {
//     redis: { port: 6379, host: '127.0.0.1', db: 2 }
//   });
//   private static readonly MAX_ATTEMPTS = 4;

//   // function to enqueue email tasks
//   public static async enqueueEmail(to: string, subject: string, body: string) {
//     // Enqueue the email task
//     await this.emailQueue.add({
//       to,
//       subject,
//       body
//     });
//   }

//   constructor() {
//     console.log('QueueWorker initialized');
//     this.beginProcessing();
//     this.registerEvents();
//   }

//   private beginProcessing() {
//     QueueWorker.emailQueue.process(async (job) => {
//       const { to, subject, body } = job.data;
//       try {
//         const responseEmail = await sendMail(to, subject, body);
//         if (!responseEmail) {
//           throw new Error('No response from mail service');
//         }
//         console.log(`Email sent to ${to}`);
//       } catch (error: any) {
//         console.error(`Failed to send email to ${to}: ${error.message}`);
//         throw error;
//       }
//     });
//   }

//   private registerEvents() {
//     QueueWorker.emailQueue.on('failed', async (job, err) => {
//       if (job.attemptsMade >= QueueWorker.MAX_ATTEMPTS) {
//         console.error(`Job permanently failed for ${job.data.to}: ${err.message}`);
//       } else {
//         console.warn(`Retrying job for ${job.data.to} (attempt ${job.attemptsMade + 1})`);
//         try {
//           await job.retry();
//         } catch (retryErr) {
//           console.error(`Retry failed for ${job.data.to}: ${retryErr.message}`);
//         }
//       }
//     });

//     QueueWorker.emailQueue.on('completed', (job) => {
//       console.log(`Job ${job.id} completed successfully.`);
//     });

//     QueueWorker.emailQueue.on('error', (err) => {
//       console.error('Queue error:', err);
//     });
//   }
// }
