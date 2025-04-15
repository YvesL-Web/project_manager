import express, { Express } from 'express';
import * as config from '../server_config.json';
import { IServerConfig } from 'utils/config';

export class ExpressServer {
  private static server = null;
  public server_config: IServerConfig = config;
  constructor() {
    const port = this.server_config.port ?? 3000;
    // Initialize express app
    const app = express();

    app.get('/ping', (req, res) => {
      res.send('pong');
    });

    ExpressServer.server = app.listen(port, () => {
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
