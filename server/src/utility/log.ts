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

const logDebug = R.curry(logger.debug)
export const Debug = logDebug()
export const Info = R.curry(logger.info)

