import {expect} from "chai"
import {convertToValidMessage} from "./message-filters" 
import * as E from "fp-ts/lib/Either";

it('Should return valid messages', () => {
    const res = convertToValidMessage("Nice to meet you")
    const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
    expect(value).to.equal("Nice to meet you")

    const res2 = convertToValidMessage("I am doing great")
    const value2 = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res2); 
    expect(value2).to.equal("I am doing great")
  });

  it('Should return truncated messages', () => {
    const res = convertToValidMessage("First of all, for proper unit testing, you should never need some sleep between tests. If you do need a sleep, this means the functions you are testing require a delay before completing its expected task, which must be handled inside that function, with some asynchronous wait or sleep. Upon exit from a function, its lifetime must end and the expected result must be acquired immediately.")
    const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
    expect(value).to.equal("First of all, for proper unit testing, you should never need some sleep between tests. If you do need a sleep, this means the functions you are testing require a delay before completing its expected t...")

    const res2 = convertToValidMessage("I am doing great")
    const value2 = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res2); 
    expect(value2).to.equal("I am doing great")
  });

it('Should filter http url messages', () => {
    const res = convertToValidMessage("http://fish.com")
    const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
    expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
});

it('Should filter https url messages', () => {
    const res = convertToValidMessage("https://fish.com")
    const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
    expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
});

it('Should filter insulting messages', () => {
    const res = convertToValidMessage("dork! you idiot")
    const value = E.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(res); 
    expect(value).to.equal("Sorry! Your message is blocked due to violation of policy")
});