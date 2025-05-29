import Queue from 'bull';
import { sendMail } from '../mailtrap/emails';

export class QueueWorker {
  private static readonly emailQueue = new Queue('emailQueue', {
    redis: { port: 6379, host: '127.0.0.1', db: 2 }
  });
  private static readonly MAX_ATTEMPTS = 4;
  private static workerStarted = false;

  /**
   * Enqueue an email job with retry options.
   */
  public static async enqueueEmail(to: string, subject: string, body: string) {
    await this.emailQueue.add({ to, subject, body }, { attempts: this.MAX_ATTEMPTS, backoff: { type: 'exponential', delay: 2000 } });
  }

  /**
   * Start the worker if not already started.
   */
  public static startWorker() {
    if (this.workerStarted) return;
    this.workerStarted = true;
    this.processJobs();
    this.registerEvents();
    console.log('QueueWorker started and listening for jobs.');
  }

  /**
   * Process jobs from the queue.
   */
  private static processJobs() {
    this.emailQueue.process(async (job) => {
      const { to, subject, body } = job.data;
      try {
        const responseEmail = await sendMail(to, subject, body);
        if (!responseEmail) throw new Error('No response from mail service');
        console.log(`Email sent to ${to}`);
      } catch (error: any) {
        console.error(`Failed to send email to ${to}: ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * Register queue events for logging and retry logic.
   */
  private static registerEvents() {
    this.emailQueue.on('failed', async (job, err) => {
      if (job.attemptsMade >= this.MAX_ATTEMPTS) {
        console.error(`Job permanently failed for ${job.data.to}: ${err.message}`);
      } else {
        console.warn(`Job for ${job.data.to} failed (attempt ${job.attemptsMade}). Will retry if attempts remain.`);
      }
    });

    this.emailQueue.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully.`);
    });

    this.emailQueue.on('error', (err) => {
      console.error('Queue error:', err);
    });
  }
}

// Pour démarrer le worker, il suffit d'appeler :
// QueueWorker.startWorker();

// Pour ajouter un email à la queue, utilisez :
// await QueueWorker.enqueueEmail('to@email.com', 'Subject', 'Body');
