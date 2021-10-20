import { pipe } from 'fp-ts/function';
import * as D from 'io-ts/Decoder'
import * as E from "fp-ts/lib/Either";

const stringToIntPortDecoder: D.Decoder<string, number> = {
    decode: s => pipe(
        Number.parseInt(s, 10),
        n => Number.isNaN(n) || n < 0 || n > 65535 ? D.failure(n, "Invalid port number") : D.success(n),
    ),
}

const intPortDecoder = D.compose(stringToIntPortDecoder)(D.string)

const defaultPort: <A>(defaultValue: A) => (decoder: D.Decoder<unknown, A>) => D.Decoder<unknown, A> = (defaultValue) => (decoder) => ({
    decode: (v) => v === undefined ? D.success(defaultValue) : decoder.decode(v)
})

const defaultEnv: <A>(defaultValue: A) => (decoder: D.Decoder<unknown, A>) => D.Decoder<unknown, A> = (defaultValue) => (decoder) => ({
    decode: (v) => v === undefined ? D.success(defaultValue) : decoder.decode(v)
})

export const configDecoder = D.struct({
    NODE_ENV: defaultEnv("development")(D.string),
    PORT:  defaultPort(8080)(intPortDecoder),
})

const configReader = (configs?: NodeJS.ProcessEnv) => configDecoder.decode(configs || process.env)
export const appConfigs = (configs?: NodeJS.ProcessEnv) => {
    const validated = configReader(configs);
    if (E.isLeft(validated)) {
        throw new Error('invalid configs');
    }
    return validated.right;
}