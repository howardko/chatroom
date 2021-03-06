/* eslint-disable @typescript-eslint/no-explicit-any */
import * as R from "ramda"
import {appConfigs} from "../config/config"

const logger = {
    debug: (message?: any, ...optionalParams: any[]): void => {
        const env = appConfigs().NODE_ENV
        if(env === "development"){
            console.log(message, ...optionalParams)
        } 
    },
    info: (message?: any, ...optionalParams: any[]): void => {
        console.log(message, ...optionalParams)
    }
}

export const Debug = R.curry(logger.debug)
export const Info = R.curry(logger.info)

