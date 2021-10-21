import {expect} from "chai"
import {convertToValidMessage} from "./message-filters" 

it('Should return valid messages', () => {
    const res = convertToValidMessage("Nice to meet you")
    expect(res.converted).to.equal("Nice to meet you")
    expect(res.valid).to.true

    const res2 = convertToValidMessage("I am doing great")
    expect(res2.converted).to.equal("I am doing great")
    expect(res2.valid).to.true
  });

it('Should filter http url messages', () => {
    const res = convertToValidMessage("http://fish.com")
    expect(res.converted).to.equal("Sorry! Your message is blocked due to violation of policy")
    expect(res.valid).to.false
});

it('Should filter https url messages', () => {
    const res = convertToValidMessage("https://fish.com")
    expect(res.converted).to.equal("Sorry! Your message is blocked due to violation of policy")
    expect(res.valid).to.false
});

it('Should filter insulting messages', () => {
    const res = convertToValidMessage("dork! you idiot")
    expect(res.converted).to.equal("Sorry! Your message is blocked due to violation of policy")
    expect(res.valid).to.false
});