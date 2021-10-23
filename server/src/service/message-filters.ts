import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either";

const urlFilter = (message: string) => message.indexOf("http://") < 0 && message.indexOf("https://") < 0
const insultingWordsFilter = (message: string) => message.toLowerCase().indexOf("dork") < 0
const filters = [
    urlFilter,
    insultingWordsFilter
]
const filterMessage = (message: string) =>
  pipe(
    filters,
    A.reduce(O.some(message), (prevO, filter) =>
      pipe(
        prevO,
        O.chain(O.fromPredicate(filter))
      )
    )
  )

const truncateString = (str: string) => (str.length <= 200) ? str : str.slice(0, 200) + '...'
// export const convertToValidMessage = (message: string): {
//     converted: string, 
//     valid: boolean
// } => {
//     const converted = O.getOrElse(() => "")(
//         pipe(
//         filterMessage(message),
//         O.fromNullable,
//         O.map((value) => truncateString(O.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(value)))
//     ))
//     return {
//         converted: converted, 
//         valid: converted != "Sorry! Your message is blocked due to violation of policy"
//    }
// }

export const convertToValidMessage = (message: string): E.Either<Error, string> => {
  const BAD_MESSAGE = "Bad message"
  const converted = O.getOrElse(() => "")(
      pipe(
      filterMessage(message),
      O.fromNullable,
      O.map((value) => truncateString(O.getOrElse(() => BAD_MESSAGE)(value)))
  ))
  const isValid = converted != BAD_MESSAGE
  return isValid
    ? E.right(converted)
    : E.left(new Error(BAD_MESSAGE))
}