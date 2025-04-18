import cluster from 'cluster';
import { ExpressServer } from './express_server';
import { DatabaseUtil } from './utils/db';
import { DDLUtil } from './utils/ddl_util';

// connect the express server
const server = new ExpressServer();

// connect database
new DatabaseUtil();

process.on('uncaughtException', (error: Error) => {
  console.error(`Uncaught exception in worker process ${process.pid}:`, error);
  // Close any open connections or resources
  server.closeServer();
  setTimeout(() => {
    cluster.fork();
    cluster.worker?.disconnect();
  }, 1000);
});
// Gracefully handle termination signals
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server gracefully.');
  // Close any open connections or resources
  server.closeServer();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully.');
  // Close any open connections or resources
  server.closeServer();
});
