import { MessageEvent } from '../models/message'
import { User } from '../models/user'

export const state = {
    user: {} as User,
    messages: [] as MessageEvent[]
}

export type State = typeof state