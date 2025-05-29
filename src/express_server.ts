import express from 'express';
import * as config from '../server_config.json';
import cookieParser from 'cookie-parser';
import { IServerConfig } from './utils/config';
import { Routes } from './routes';

export class ExpressServer {
  private static server = null;
  public server_config: IServerConfig = config;
  public app;
  constructor() {
    const port = this.server_config.port ?? 3000;
    // Initialize express app
    this.app = express();
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use(express.json());
    this.app.use(cookieParser());

    this.app.get('/ping', (req, res) => {
      res.send('pong');
    });

    const routes = new Routes(this.app);
    if (routes) {
      console.log('Server Routes started for server');
    }

    ExpressServer.server = this.app.listen(port, () => {
      console.log(`Server is running on port ${port} with pid = ${process.pid}`);
    });
  }
  //close the express server for safe on uncaughtException
  public closeServer(): void {
    ExpressServer.server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }
}
