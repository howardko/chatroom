import {createSandbox} from "sinon"
import {assert, expect} from "chai"
import {appConfigs} from "./config"

describe('[config] Tests for reading configs', function () {
  it('1. Valid port range and environment', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({ 'NODE_ENV': 'production', 'PORT': "16888"});
    const configs = appConfigs();
    assert(configs.NODE_ENV == "production");
    assert(configs.PORT == 16888);
    sandbox.restore();
  });

  it('2. No port and environment configs and thus default port and environment are set', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({});
    const configs = appConfigs();
    assert(configs.NODE_ENV == "development");
    assert(configs.PORT == 8080);
    sandbox.restore();
  });

  it('3. Invalid port range (-1) with error raised', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({'PORT': "-1"});
    expect(() =>  {
      appConfigs();
    }).to.throw('invalid configs');
    sandbox.restore();
  });

  it('4. Invalid port range (1688888) with error raised', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({'PORT': "1688888"});
    expect(() =>  {
      appConfigs();
    }).to.throw('invalid configs');
    sandbox.restore();
  });

  it('5. Invalid port range (1688888) with error raised', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({'PORT': "1688888"});
    expect(() =>  {
      appConfigs();
    }).to.throw('invalid configs');
    sandbox.restore();
  });

  it('6. Invalid environment with error raised', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({'NODE_ENV': 'earth'});
    expect(() =>  {
      appConfigs();
    }).to.throw('invalid configs');
    sandbox.restore();
  });
});