import {spy} from "sinon"
import {expect} from "chai"
import {Users} from "./user" 
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { User } from '../type/user';

it('Should successfully add one user', () => {
  const noUser: Record<string,User> = {"": {name: "", socketId: ""}}
  const users = Users.add({}, "Howard", {name: "Howard", socketId: "12345"})
  const res = E.getOrElse((e:Error) => noUser)(users)
  expect(res["Howard"].name).to.equals("Howard")
  expect(res["Howard"].socketId).to.equals("12345")
});

it('Should not add the same user', () => {
  const noUser: Record<string,User> = {"": {name: "", socketId: ""}}
  const EAdd1 = Users.add({}, "Howard", {name: "Howard", socketId: "12345"})
  const add1 = E.getOrElse(() => noUser)(EAdd1)
  const EAdd2 = Users.add(add1, "Howard", {name: "Howard", socketId: "12345"})
  const add2 = E.getOrElse(() => noUser)(EAdd2)
  expect(add2).to.equals(noUser)
});

it('Should successfully remove one user', () => {
  const users = Users.remove({"Howard": {name: "Howard", socketId: "12345"}}, "Howard")
  expect(users).to.be.empty
});

it('Remove non existed user should still succeed', () => {
  const users = Users.remove({}, "Howard")
  expect(users).to.be.empty
});

it('Successfully get an existed user', () => {
  const user1:User = {name: "Howard", socketId: "12345"}
  const noUser = {}
  const userO = Users.get({"Howard": user1}, "Howard")
  const getUser = O.getOrElse(() => noUser)(userO);
  expect(getUser).to.equals(user1)
});

it('Should return no user when getting a non existed user', () => {
  const user1:User = {name: "Howard", socketId: "12345"}
  const noUser = {}
  const userO = Users.get({"Howard": user1}, "no_existed")
  const getUser = O.getOrElse(() => noUser)(userO);
  expect(getUser).to.be.empty
});

it('Should list the names of the users', () => {
  const users = Users.listNames({"Howard": {name: "Howard", socketId: "12345"}, "Mary": {name: "Mary", socketId: "98765"}})
  expect(users).to.eql(["Howard", "Mary"])
});

it('Should return the existed user by their socketId', () => {
  const user1 = {name: "Howard", socketId: "12345"}
  const userO = Users.getFirstBySocketId({"Howard": user1, "Mary": {name: "Mary", socketId: "98765"}}, "12345")
  const noUser = {}
  const user = O.getOrElse(() => noUser)(userO);
  expect(user).to.eql(user1)
});

it('Should return no user if no socketId matched', () => {
  const user1 = {name: "Howard", socketId: "12345"}
  const userO = Users.getFirstBySocketId({"Howard": user1, "Mary": {name: "Mary", socketId: "98765"}}, "noo_such_id")
  const noUser = {}
  const user = O.getOrElse(() => noUser)(userO);
  expect(user).to.eql({})
});