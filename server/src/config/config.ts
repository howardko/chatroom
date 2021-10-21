import { pipe } from 'fp-ts/function';
import * as D from 'io-ts/Decoder'
import * as E from "fp-ts/lib/Either";
import { DecodeError } from 'io-ts/lib/DecodeError';

const stringToIntPortDecoder: D.Decoder<string, number> = {
    decode: s => pipe(
        Number.parseInt(s, 10),
        n => Number.isNaN(n) || n < 0 || n > 65535 ? D.failure(n, `Invalid port number:${n}`) : D.success(n),
    ),
}

const stringToEnvironmentDecoder: D.Decoder<string, string> = {
    decode: s => pipe(
        s,
        s => s != "development" && s != "production" ? D.failure(s, `Invalid environment:${s}`) : D.success(s),
    ),
}
const envDecoder = D.compose(stringToEnvironmentDecoder)(D.string)
const portDecoder = D.compose(stringToIntPortDecoder)(D.string)

const defaultPort: <A>(defaultValue: A) => (decoder: D.Decoder<unknown, A>) => D.Decoder<unknown, A> = (defaultValue) => (decoder) => ({
    decode: (v) => v === undefined ? D.success(defaultValue) : decoder.decode(v)
})

const defaultEnv: <A>(defaultValue: A) => (decoder: D.Decoder<unknown, A>) => D.Decoder<unknown, A> = (defaultValue) => (decoder) => ({
    decode: (v) => v === undefined ? D.success(defaultValue) : decoder.decode(v)
})

const configDecoder = D.struct({
    NODE_ENV: defaultEnv("development")(envDecoder),
    PORT:  defaultPort(8080)(portDecoder),
})

const configReader = () => configDecoder.decode(process.env)
// version 1:
// export const appConfigs = (configs?: NodeJS.ProcessEnv) => {
//     const validated = configReader();
//     if (E.isLeft(validated)) {
//         console.log(validated.left)
//         throw new Error('invalid configs');
//     }
//     return validated.right;
// }

// version 2:
export const appConfigs = () => {
    const parse = E.fold(
        (eitherError: D.DecodeError) => {
            console.log(`invalid configs: ${D.draw(eitherError)}`)
            throw new Error("invalid configs");
        }, 
        (value: {NODE_ENV: string, PORT: number}) => value
    );

    return parse(configReader())
}