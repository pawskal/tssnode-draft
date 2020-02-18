import test from 'tape';
import { Express } from 'express'
import request from 'supertest';
import application from '../server'
import { TSNodeExpress } from '../httpPlugin';

const { express: app }: TSNodeExpress = application.setup()

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
  const { body, header } = await request(app).get(`/some/single-after-hook/someParam`);
  t.deepEqual(body, expected, 'should collect expected after hook fields');
  t.deepEqual(header['custom'], 'custom', 'should collect expected after hook fields');
  t.end()
})

test('Should return unauthorized', async (t) => {
  const expected = {
    status: 401,
    message: 'Unauthorized',
    name: 'UnauthorizedError'
  }
    const {status, body} = await request(app).post(`/auth`);
    t.equal(status, 401)
    t.deepEqual(body, expected, 'Should be Authorization Error')
    t.end()
})

test('Should return unauthorized', async (t) => {
  const expected = {
    status: 401,
    message: 'Unauthorized',
    name: 'UnauthorizedError'
  }
    const {status, body} = await request(app).post(`/auth`);
    t.equal(status, 401)
    t.deepEqual(body, expected, 'Should be Authorization Error')
    t.end()
})

test('Should return unauthorized', async (t) => {
  const expected = {
    status: 401,
    message: 'Unauthorized',
    name: 'UnauthorizedError'
  }
    const {status, body} = await request(app).post(`/auth`);
    t.equal(status, 401)
    t.deepEqual(body, expected, 'Should be Authorization Error')
    t.end()
})

test('Should return unauthorized', async (t) => {
  const expected = {
    status: 401,
    message: 'Unauthorized',
    name: 'UnauthorizedError'
  }
    const {status, body} = await request(app).post(`/auth`);
     await Promise.all([request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),
     request(app).post(`/auth`),])
    t.equal(status, 401)
    t.deepEqual(body, expected, 'Should be Authorization Error')
    t.end()
})

test('Should return auth token for John Doe', async (t) => {
  const { body: { token } } = await request(app).get(`/auth/sign-in?name=John Doe&password=qwerty9`);
  t.ok(token, 'should exist token');
  t.end();
})

test('Should return auth token for Jane Doe', async (t) => {
    const { body: {token} } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
    t.ok(token, 'should exist token');
    t.end();
})

test('Should add new user with John Doe token', async (t) => {
  const expected = {
    name: 'JohnDoe\'sUser',
    role: 'default',
  }
  const { body:{token} } = await request(app).get(`/auth/sign-in?name=John Doe&password=qwerty9`);
  const { body: {success}, status } = await request(app)
    .post(`/auth?name=JohnDoe'sUser&password=test&role=default`)
    .set('authorization', token)

  const {body:data} = await request(app)
    .get(`/auth/JohnDoe'sUser`)
    .set('authorization', token)

  t.ok(token, 'should exist token');
  t.true(success, 'success add user');
  t.equal(status, 201)
  t.deepEqual(data, expected, 'Should get JohnDoe`sUser')
  t.end();
})

test('Should return Jane`s Doe user on /me', async (t) => {
  const expected = {
    name: 'JaneDoe\'sUser',
    role: 'default',
  }
    const { body:{token} } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);

    const { body: {success} } = await request(app)
      .post(`/auth?name=JaneDoe'sUser&password=test&role=default`)
      .set('authorization', token);

    const {body: data} = await request(app).get(`/auth/sign-in?name=JaneDoe'sUser&password=test`);
    const {body: user} = await request(app)
      .get(`/auth/me`)
      .set('authorization', data.token || '');

    t.ok(token, 'should exist token');
    t.true(success, 'success add user')
    t.deepEqual(user, expected, 'Should get JaneDoe`sUser')
    t.end()
})

test('Should return Forbidden Error', async (t) => {
  const expected = {
    status: 403,
    message: 'Forbidden access for /auth/:name',
    name: 'ForbiddenError'
  }
  const { body:{token} } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
  await request(app)
    .post(`/auth?name=test&password=test&role=test`)
    .set('authorization', token);

  const {body: data} = await request(app).get(`/auth/sign-in?name=test&password=test`);
  const { body, status } = await request(app)
    .get(`/auth/Jane Doe`)
    .set('authorization', data.token || '');

    t.equal(status, 403)
    t.deepEqual(body, expected, 'Should be Forbidden Error')
    t.end()
})

test('Should return list users', async (t) => {
  const expected = [
    { name: 'John Doe', role: 'super' },
    { name: 'Jane Doe', role: 'admin' },
    { name: 'JohnDoe\'sUser', role: 'default' },
    { name: 'JaneDoe\'sUser', role: 'default' },
    { name: 'test', role: 'test' }
  ]
    const { body:{token} } = await request(app).get(`/auth/sign-in?name=Jane Doe&password=qwerty8`);
    const headers = {
      'authorization': token
    }
    const {body:data} = await request(app).get(`/auth`).set('authorization', token);

    t.ok(token, 'should exist token');
    t.deepEqual(data, expected, 'Should get users')
    t.end()
})

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

test('should return correct data from injected services without decorators', async (t) => {
  const expected = {
    injectedService: 'injected as class',
    iInjectedService: 'injected as interface'
  };
  const { body } = await request(app).get(`/some/from-external-service`);
  t.deepEqual(body, expected, 'Should external data');
  t.end();
})

test('should return correct data from injected services without decorators', async (t) => {
  const { body: foo } = await request(app).get(`/some/factory/foo`);
  const { body: bar } = await request(app).get(`/some/factory/bar`);
  t.deepEqual(foo, foo, 'should get foo');
  t.deepEqual(foo, bar, 'should get bar');
  t.end();
})
// test('exit tests', (t) => {
//   t.end();
//   process.exit(0);
// })
