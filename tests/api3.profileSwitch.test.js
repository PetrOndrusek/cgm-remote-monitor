/* eslint require-atomic-updates: 0 */
'use strict';

require('should');

describe('API3 PROFILE SWITCH', function() {
  const self = this
    , testConst = require('./fixtures/api3/const.json')
    , instance = require('./fixtures/api3/instance')
    , authSubject = require('./fixtures/api3/authSubject')
    ;

  self.docs = testConst.SAMPLE_ENTRIES;

  self.timeout(15000);


  before(async () => {
    self.testStarted = new Date();
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.url = '/api/v3/profileSwitch';

    let authResult = await authSubject(self.instance.ctx.authorization.storage);

    self.subject = authResult.subject;
    self.token = authResult.token;
    self.urlToken = `${self.url}?token=${self.token.read}`;
  });


  after(() => {
    self.instance.ctx.bus.teardown();
  });


  it('should support SEARCH operation', async () => {
    await self.instance.get(self.urlToken)
      .expect(200);
  });

});

