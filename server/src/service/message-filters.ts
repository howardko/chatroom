import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/option"
import * as A from "fp-ts/array"

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

const truncateString = (str: string) => (str.length <= 100) ? str : str.slice(0, 100) + '...'
export const convertToValidMessage = (message: string): {
    converted: string, 
    valid: boolean
} => {
    const converted = O.getOrElse(() => "")(
        pipe(
        filterMessage(message),
        O.fromNullable,
        O.map((value) => truncateString(O.getOrElse(() => "Sorry! Your message is blocked due to violation of policy")(value)))
    ))
    return {
        converted: converted, 
        valid: converted != "Sorry! Your message is blocked due to violation of policy"
   }
}

