import {createSandbox} from "sinon"
import {assert, expect} from "chai"
import {appConfigs} from "./config"

it('Valid port range and environment', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({ 'NODE_ENV': 'production', 'PORT': "16888"});
  const configs = appConfigs(process.env);
  assert(configs.NODE_ENV == "production");
  assert(configs.PORT == 16888);
  sandbox.restore();
});

it('No port and environment configs and thus default port and environment are set', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({});
  const configs = appConfigs(process.env);
  assert(configs.NODE_ENV == "development");
  assert(configs.PORT == 8080);
  sandbox.restore();
});

it('Invalid port range (-1) with error raised', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({'PORT': "-1"});
  expect(() =>  {
    appConfigs(process.env);
  }).to.throw('invalid configs');
  sandbox.restore();
});

it('Invalid port range (1688888) with error raised', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({'PORT': "1688888"});
  expect(() =>  {
    appConfigs(process.env);
  }).to.throw('invalid configs');
  sandbox.restore();
});

it('Invalid port range (1688888) with error raised', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({'PORT': "1688888"});
  expect(() =>  {
    appConfigs(process.env);
  }).to.throw('invalid configs');
  sandbox.restore();
});