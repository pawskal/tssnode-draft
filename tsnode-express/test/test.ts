import test from 'tape';
import { Express } from 'express'
import request from 'supertest';
import application from '../server'

let app: Express;

test('start server', async (t) => {
  await application
      .start((express: Express) => {
        app = express
        t.end()
      }
    );
})

test('server should be live', async (t) => {
  const { body } = await request(app).get(`/health`);
  t.equal(body.status, 'live', 'status should be live');
  t.end();

})

test('server should return 404', async (t) => {
  const expected  = {
    status: 404,
    message: 'Route /incorrect was not found',
    name: 'NotFoundError'
  };
  const { body, status } = await request(app).get(`/incorrect`);
  t.equal(status, 404)
  t.deepEqual(body, expected, 'Should be Not Found Error');
  t.end();

})

test('server should get success', async (t) => {
  const { body } = await request(app).get(`/some`);
  t.equal(body.data, 'success', 'data should be success');
  t.end();

})

test('server should return data from service', async (t) => {
  const { body } = await request(app).get(`/some/service`);
  t.equal(body.data, 'from service', 'data sould be from service');
  t.end();

})

test('server should return data from service with config field', async (t) => {
  const { body } = await request(app).get(`/some/service`);
  t.equal(body.configField, 'test config field', 'data sould be from config provider');
  t.end();

})

test('server should return echo', async (t) => {
  const expected = {
    body: 'echoBody',
    params: 'echoParam',
    query: 'echoQuery'
  };
  const { body } = await request(app)
    .post(`/some/echo/echoParam?echo=echoQuery`)
    .send({ data: 'echoBody' })
  t.deepEqual(body, expected, 'should collect expected echo fields');
  t.end();

})

test('Single after hook should works', async (t) => {
  const expected = {
    break: 'response closed manually',
  };
  const { body } = await request(app).get(`/some/single-after-hook/someParam`);
  t.deepEqual(body, expected, 'should collect expected after hook fields');
  t.end()
})

// test('Should return unauthorized', async (t) => {
//   const expected = {
//     status: 401,
//     message: 'Unauthorized',
//     name: 'UnauthorizedError'
//   }
//   try {
//     await request(app).post(`/auth`);
//   }
//   catch({ error }) {
//     t.ok(error);
//     t.deepEqual(error, expected, 'Should be Authorization Error')
//   }
//   finally { t.end(); }
// })

// test('Should return auth token for John Doe', async (t) => {
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=John Doe&password=qwerty9`);
//     t.ok(token, 'should exist token');
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

// test('Should return auth token for Jane Doe', async (t) => {
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
//     t.ok(token, 'should exist token');
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

// test('Should add new user with John Doe token', async (t) => {
//   const expected = {
//     name: 'JohnDoe\'sUser',
//     role: 'default',
//   }
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=John Doe&password=qwerty9`);
//     const headers = {
//       'authorization': token
//     }
//     const { success } = await request(app).post(`/auth?name=JohnDoe'sUser&password=test&role=default`,
//                                             Object.assign({}, { headers }));

//     const data = await request(app).get(`/auth/JohnDoe'sUser`, Object.assign({}, { headers }))
//     t.ok(token, 'should exist token');
//     t.true(success, 'success add user')
//     t.deepEqual(data, expected, 'Should get JohnDoe`sUser')
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

// test('Should return Jane`s Doe user on /me', async (t) => {
//   const expected = {
//     name: 'JaneDoe\'sUser',
//     role: 'default',
//   }
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
//     const headers = {
//       'authorization': token
//     }
//     const { success } = await request(app).post(`/auth?name=JaneDoe'sUser&password=test&role=default`,
//                                             Object.assign({}, { headers }));

//     const data = await request(app).get(`/auth/sign-in?name=JaneDoe'sUser&password=test`);
//     headers['authorization'] = data.token
//     const user = await request(app).get(`/auth/me`, Object.assign({}, { headers }));
//     t.ok(token, 'should exist token');
//     t.true(success, 'success add user')
//     t.deepEqual(user, expected, 'Should get JaneDoe`sUser')
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

// test('Should return Forbidden Error', async (t) => {
//   const expected = {
//     status: 403,
//     message: 'Forbidden access for /auth/:name',
//     name: 'ForbiddenError'
//   }
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
//     const headers = {
//       'authorization': token
//     }
//     await request(app).post(`/auth?name=test&password=test&role=test`,
//                                             Object.assign({}, { headers }));

//     const data = await request(app).get(`/auth/sign-in?name=test&password=test`);
//     headers['authorization'] = data.token
//     await request(app).get(`/auth/Jane Doe`, Object.assign({}, { headers }));
//   }
//   catch({ error }) {
//     t.ok(error);
//     t.deepEqual(error, expected, 'Should be Forbidden Error')
//   }
//   finally { t.end(); }
// })

// test('Should return list users', async (t) => {
//   const expected = [
//     { name: 'John Doe', role: 'super' },
//     { name: 'Jane Doe', role: 'admin' },
//     { name: 'JohnDoe\'sUser', role: 'default' },
//     { name: 'JaneDoe\'sUser', role: 'default' },
//     { name: 'test', role: 'test' }
//   ]
//   try {
//     const { token } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
//     const headers = {
//       'authorization': token
//     }
//     const data = await request(app).get(`/auth`, Object.assign({}, { headers }));

//     t.ok(token, 'should exist token');
//     t.deepEqual(data, expected, 'Should get users')
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

test('should catch custom error', async (t) => {
  const expected = {
    name: "BadRequestError",
    status: 400,
    message: "custom error"
  };
  const { body, status } = await request(app).get(`/some/custom-error`);
  t.equal(status, 400)
  t.deepEqual(body, expected, 'catch custom error');
  t.end()
})

test('should catch internal error', async (t) => {
  const expected = {
    name: 'InternalServerError',
    status: 500,
    message: 'Cannot read property \'charCodeAt\' of undefined'
  };
  const { body, status }  = await request(app).get(`/some/internal-error`);
  t.equal(status, 500)
  t.deepEqual(body, expected, 'catch internal error');
  t.end();

})

// test('should return correct data from injected services without decorators', async (t) => {
//   const expected = {
//     injectedService: 'injected as class',
//     iInjectedService: 'injected as interface'
//   };
//   try {
//     const data = await request(app).get(`/some/from-external-service`);
//     t.deepEqual(data, expected, 'Should external data');
//   }
//   catch(e) { t.ifErr(e); }
//   finally { t.end(); }
// })

// test('exit tests', (t) => {
//   t.end();
//   process.exit(0);
// })
