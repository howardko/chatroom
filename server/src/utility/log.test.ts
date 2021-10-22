import {spy} from "sinon"
import {assert} from "chai"
import {createSandbox} from "sinon"
import {Debug, Info} from "./log" 

it('should log the info message to console when in development', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({ 'NODE_ENV': 'development'});
  let consoleLog = spy(console, 'log');
  Info("test log");
  assert(consoleLog.calledWith("test log"), "Console.og does not output: test log");

  const testOutputObj = {attr1: "att1", attr2: 2}
  Info(testOutputObj);
  assert(consoleLog.calledWith(testOutputObj), `Console.og does not output: ${testOutputObj}`);
  consoleLog.restore();
});

it('should log the info message to console when in production', () => {
  const sandbox = createSandbox();
  sandbox.stub(process, 'env').value({ 'NODE_ENV': 'production'});
  let consoleLog = spy(console, 'log');
  Info("test log");
  assert(consoleLog.calledWith("test log"), "Console.og does not output: test log");

  const testOutputObj = {attr1: "att1", attr2: 2}
  Info(testOutputObj);
  assert(consoleLog.calledWith(testOutputObj), `Console.og does not output: ${testOutputObj}`);
  consoleLog.restore();
});

it('should log the debug message to console when in development', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({ 'NODE_ENV': 'development'});
    let consoleLog = spy(console, 'log');
    Debug("test log");
    assert(consoleLog.calledWith("test log"), "Console.og does not output: test log");

    const testOutputObj = {attr1: "att1", attr2: 2}
    Debug(testOutputObj);
    assert(consoleLog.calledWith(testOutputObj), `Console.og does not output: ${testOutputObj}`);
    consoleLog.restore();
  });

it('should not log the debug message to console when in production', () => {
    const sandbox = createSandbox();
    sandbox.stub(process, 'env').value({ 'NODE_ENV': 'production'});
    let consoleLog = spy(console, 'log');
    Debug("test log");
    assert(consoleLog.notCalled, "Console.log called");

    const testOutputObj = {attr1: "att1", attr2: 2}
    Debug(testOutputObj);
    assert(consoleLog.notCalled, "Console.log called");
    consoleLog.restore();
  });