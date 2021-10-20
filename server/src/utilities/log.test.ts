import {spy} from "sinon"
import {assert} from "chai"
// import {ComputeWithFpts} from "./log" 

it('should log the message to console when in development', () => {
    // let consoleLog = spy(console, 'log');
    // debug("development", "test log");
    // assert(consoleLog.calledWith("test log"));
    // consoleLog.restore();
  });

it('should not log the message to console when in production', () => {
    // let consoleLog = spy(console, 'log');
    // debug("production", "test log");
    // consoleLog.notCalled;
    // consoleLog.restore();

    //logDebug("Hello")("aaa")
  });