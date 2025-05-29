import * as chai from 'chai';
import chaiHttp, { request } from 'chai-http';
import { describe, it } from 'mocha';
import { app } from '../utility.spec';

chai.use(chaiHttp);
const expect = chai.expect;
let authToken: string;

describe('Login API', () => {
  it('should return a success message when login is successful', (done) => {
    request
      .execute(app)
      .post('/api/login')
      .send({ email: 'email', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').equal('success');
        // récupérer le cookie
        const cookies = res.header['set-cookie'];
        // Chercher le cookie access_token
        if (cookies) {
          const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
          const accessTokenCookie = cookiesArray.find((c: string) => c.startsWith('access_token='));
          if (accessTokenCookie) {
            authToken = accessTokenCookie.split(';')[0].split('=')[1];
          }
        }
        done();
      });
  });
  it('should return an error message when login fails', (done) => {
    request
      .execute(app)
      .post('/api/login')
      .send({ email: 'email', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('message').equal('Invalid credentials');
        done();
      });
  });
});

describe('GET list of users', () => {
  it('should return array with status code 200', (done) => {
    request
      .execute(app)
      .get('/api/users')
      .set('Cookie', `access_token=${authToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data').that.is.an('array');
        // Vérifie que chaque élément est un objet
        res.body.data.forEach((item: any) => {
          expect(item).to.be.an('object');
        });
        done();
      });
  });
});

export { authToken };
