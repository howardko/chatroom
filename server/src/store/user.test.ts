import {expect} from "chai"
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { User } from '../model/user';
import {Users} from "./user" 

describe('[user] Tests for user store management', function () {
  it('1. Should successfully add one user', () => {
    const noUser: Record<string,User> = {"": {name: "", socketId: ""}}
    const users = Users.add({}, "Howard", {name: "Howard", socketId: "12345"})
    const res = E.getOrElse(() => noUser)(users)
    expect(res["Howard"].name).to.equals("Howard")
    expect(res["Howard"].socketId).to.equals("12345")
  });

  it('2. Should not add the same user', () => {
    const noUser: Record<string,User> = {"": {name: "", socketId: ""}}
    const EAdd1 = Users.add({}, "Howard", {name: "Howard", socketId: "12345"})
    const add1 = E.getOrElse(() => noUser)(EAdd1)
    const EAdd2 = Users.add(add1, "Howard", {name: "Howard", socketId: "12345"})
    const add2 = E.getOrElse(() => noUser)(EAdd2)
    expect(add2).to.equals(noUser)
  });

  it('3. Should successfully remove one user', () => {
    const users = Users.remove({"Howard": {name: "Howard", socketId: "12345"}}, "Howard")
    expect(users).to.be.empty
  });

  it('4. Remove non existed user should still succeed', () => {
    const users = Users.remove({}, "Howard")
    expect(users).to.be.empty
  });

  it('5. Successfully get an existed user', () => {
    const user1:User = {name: "Howard", socketId: "12345"}
    const noUser = {}
    const userO = Users.get({"Howard": user1}, "Howard")
    const getUser = O.getOrElse(() => noUser)(userO);
    expect(getUser).to.equals(user1)
  });

  it('6. Should return no user when getting a non existed user', () => {
    const user1:User = {name: "Howard", socketId: "12345"}
    const noUser = {}
    const userO = Users.get({"Howard": user1}, "no_existed")
    const getUser = O.getOrElse(() => noUser)(userO);
    expect(getUser).to.be.empty
  });

  it('7. Should list the names of the users', () => {
    const users = Users.listNames({"Howard": {name: "Howard", socketId: "12345"}, "Mary": {name: "Mary", socketId: "98765"}})
    expect(users).to.eql(["Howard", "Mary"])
  });

  it('8. Should return the existed user by their socketId', () => {
    const user1 = {name: "Howard", socketId: "12345"}
    const userO = Users.getFirstBySocketId({"Howard": user1, "Mary": {name: "Mary", socketId: "98765"}}, "12345")
    const noUser = {}
    const user = O.getOrElse(() => noUser)(userO);
    expect(user).to.eql(user1)
  });

  it('9. Should return no user if no socketId matched', () => {
    const user1 = {name: "Howard", socketId: "12345"}
    const userO = Users.getFirstBySocketId({"Howard": user1, "Mary": {name: "Mary", socketId: "98765"}}, "noo_such_id")
    const noUser = {}
    const user = O.getOrElse(() => noUser)(userO);
    expect(user).to.eql({})
  });

  it('10. Should get correct user counts', () => {
    
    let cnts = Users.userCount({})
    expect(cnts).to.equals(0)
    const user1 = {name: "Howard", socketId: "12345"}
    cnts = Users.userCount({"Howard": user1})
    expect(cnts).to.equals(1)
    const user2 = {name: "Mary", socketId: "1111"}
    cnts = Users.userCount({"Howard": user1, "Mary": user2})
    expect(cnts).to.equals(2)
  });
});