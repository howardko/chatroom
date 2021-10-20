import * as R from "ramda"

const logger = {
    debug: (env:string, log: string): void => {
        if(env == "development"){
            console.log(log)
        } 
    },
    info: (env:string, log: string): void => {
        console.log(log)
    }
}

export const logDebug = R.curry(logger.debug)
export const logDebugDEV = logDebug("developmment")
export const logInfo = R.curry(logger.info)

import { pipe } from 'fp-ts/function';
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
