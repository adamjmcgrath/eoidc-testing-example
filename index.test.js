const got = require('got');
const app = require('./');

jest.mock('express-openid-connect', () => ({
  auth() {
    return (req, res, next) => {
      req.oidc = {
        user: {
          sub: '__user__'
        }
      }
      next();
    }
  }
}));

let server;

beforeEach((done) => {
  server = app.listen(3000, () => {
    done();
  })
})

afterEach((done) => {
  server.close(done);
})


test('app', async () => {
  const response = await got('http://localhost:3000', { responseType: 'json' });
  expect(response.body).toMatchObject({ user: '__user__' });
});
