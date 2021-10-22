import { User } from '../type/user';
import * as R from "fp-ts/lib/Record";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function"

export const Users = {
  add(users:Record<string,User>, userName: string, user: User): E.Either<Error,Record<string,User>>{
    return R.has(userName, users)
      ? E.left(new Error("The user already exists"))
      : E.right(R.upsertAt(userName, user)(users))
  },
  remove(users:Record<string,User>,userName: string):Record<string,User>{
    return R.deleteAt(userName)(users)
  },
  get(users:Record<string,User>, userName: string): O.Option<User> {
    return R.lookup(userName)(users)
  },
  getFirstBySocketId(users:Record<string,User>, socketId: string): O.Option<User> {
    // return pipe(
    //   R.filter( (user:User) => user.socketId == socketId)(users),
    //   R.keys,
    //   A.head,
    //   O.fromNullable,
    //   O.flatten,
    //   O.map((userName) => R.lookup(userName)(users)),
    //   O.flatten,
    // )
    return pipe(
      R.filter( (user:User) => user.socketId == socketId)(users),
      R.keys,
      A.head,
      O.chain(O.fromNullable),
      O.map((userName) => R.lookup(userName)(users)),
      O.flatten,
    )
  },
  listNames(users:Record<string,User>): Array<string> {
    return R.keys(users);
  }
}