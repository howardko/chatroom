import { User } from '../type/user';
import {Users} from "../store/user" 
import * as O from "fp-ts/lib/Option";
import { Socket } from "socket.io";
import { MessageEvent } from "../type/message";
import { MessageTypes } from "../type/message-type";
import { ChannelNames } from "../type/channel-name";
import * as R from "ramda"
import { pipe } from "fp-ts/lib/function"
// let users = {} as Record<string,User>

// join

// leave
const isLeaveNotice = (event: MessageEvent)  => event.type == MessageTypes.leave_notice
export const leaveChatroomBroadcastAll = (socket: Socket, event: MessageEvent)  => {
  if(isLeaveNotice(event)){
    // console.log(event)
    socket.emit(ChannelNames.chatroom, event)
  }
}
// disconnect
export const disconnectChatroomBroadcastAll = (socket: Socket, users: Record<string,User>, now: Date)  => {
    pipe(
      Users.getFirstBySocketId(users, socket.id),
      O.chain(O.fromNullable),
      O.fold(
        () => {}, 
        (user: User) => {
          // console.log("&&&&&&", user)
          const message = `${user.name} left`
          const event = {type: MessageTypes.leave_notice, username: user.name, toId: "", isPrivate: false, message: message, sentAt: now}
          socket.emit(ChannelNames.chatroom, event)
        }
      )
    )
}

// public message

// private message

// online users