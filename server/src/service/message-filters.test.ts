import {expect} from "chai"
import * as E from "fp-ts/lib/Either";
import {convertToValidMessage} from "./message-filters" 

describe('[message-filters] Tests for filtering chat messages', function () {
  it('1. Should return valid messages', () => {
      const res = convertToValidMessage("Nice to meet you")
      const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
      expect(value).to.equal("Nice to meet you")

      const res2 = convertToValidMessage("I am doing great")
      const value2 = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res2); 
      expect(value2).to.equal("I am doing great")
    });

    it('2. Should return truncated messages', () => {
      const res = convertToValidMessage("First of all, for proper unit testing, you should never need some sleep between tests. If you do need a sleep, this means the functions you are testing require a delay before completing its expected task, which must be handled inside that function, with some asynchronous wait or sleep. Upon exit from a function, its lifetime must end and the expected result must be acquired immediately.")
      const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
      expect(value).to.equal("First of all, for proper unit testing, you should never need some sleep between tests. If you do need a sleep, this means the functions you are testing require a delay before completing its expected t...")

      const res2 = convertToValidMessage("I am doing great")
      const value2 = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res2); 
      expect(value2).to.equal("I am doing great")
    });

  it('3. Should filter http url messages', () => {
      const res = convertToValidMessage("http://fish.com")
      const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
      expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
  });

  it('4. Should filter https url messages', () => {
      const res = convertToValidMessage("https://fish.com")
      const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
      expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
  });

  it('5. Should filter insulting messages', () => {
      const res = convertToValidMessage("dork! you idiot")
      const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
      expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
  });
});