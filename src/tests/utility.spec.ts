import * as chai from 'chai';
import chaiHttp from 'chai-http';
import { DatabaseUtil } from '../utils/db';
import { ExpressServer } from '../express_server';

chai.use(chaiHttp);
// use chai with chai-http
let app: any;
let expressServer: ExpressServer;

before(async () => {
  const databaseUtil = new DatabaseUtil();
  await databaseUtil.connectDatabase();
  expressServer = new ExpressServer();
  app = expressServer.app;
});
// close ther server after all tests are done
after(function (done) {
  expressServer.closeServer();
  done();
});

export { app };
