/* eslint-disable @typescript-eslint/no-empty-function */
import { User } from '../model/user';
import {Users} from "../store/user" 
import {convertToValidMessage} from "./message-filters" 
import { Socket, Server } from "socket.io";
import { MessageEvent } from "../model/message";
import { Command } from "../model/command";
import { MessageTypes } from "../type/message-type";
import { CommandTypes } from "../type/command-type";
import { ChannelNames } from "../type/channel-name";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function"
import { Debug } from "../utility/log";

// join
export const joinChatroomBroadcastAll = (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent)  => {
    return pipe(
      event.username,
      O.fromNullable,
      O.fold(
        () => E.left(new Error("The user has no name")),
        (userName: string) => {
          return (userName === "") ? E.left(new Error("The user has no name")): E.right(userName)
        }
      ),
      E.fold(
        () => E.left(new Error("The user has no name")),
        () => {
          Debug("[joinChatroomBroadcastAll-Right] Received event:", event)
          return Users.add(users, event.username, {name: event.username, socketId: fromSocket.id})
        }
      ),
      E.fold(
        () => {
          Debug("[joinChatroomBroadcastAll-Left] Add a user failed")
          const command: Command = {
            type: CommandTypes.forcedLeave,
            to: event.username,
            message: "Invalid user name or a user with the same name has already joined"
          }
          fromSocket.emit(ChannelNames.command, command)
          return users
        },
        (addedUsers) => {
          Debug("[joinChatroomBroadcastAll-Right] Successfully add a user")
          server.emit(ChannelNames.chatroom, event)
          return addedUsers
        }
      ),
    )
    //return E.getOrElse(() => users)(usersE)
}

// leave
export const leaveChatroomBroadcastAll = (users: Record<string,User>, server: Server, event: MessageEvent)  => {
  return pipe(
    event.username,
    O.fromNullable,
    O.fold(
      () => users,
      () => {
        Debug("[leaveChatroomBroadcastAll] Received event:", event)
        server.emit(ChannelNames.chatroom, event)
        return Users.remove(users, event.username)
      }
    )
  )
}

// private message
export const privateMessage = (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent)  => {
  Debug(`[privateMessage] Received event:`, event)
  pipe(
    event.to,
    O.fromNullable,
    O.fold(
      () => {
        Debug(`[privateMessage - Left] No specified user, send to all`)
        server.emit(ChannelNames.chatroom, event)
        return O.none
      },
      (receiverName) => {
        Debug(`[privateMessage - Right] The reciever is not empty:${receiverName}`)
        return (receiverName !== "") ? Users.get(users, receiverName): O.none
      }
    ),
    O.chain(O.fromNullable),
    O.fold(
      () => {
        event.message = `There is no such user:${event.to}`
        fromSocket.emit(ChannelNames.chatroom, event)
        Debug(`[privateMessage - Left] Can not find the user, converted event:`, event)
      },
      (user) => {
        Debug(`[privateMessage - Right] To user ${user.name},socketId:${user.socketId}`)
        const toSocket = server.sockets.sockets.get(user.socketId)
        pipe(
          toSocket,
          O.fromNullable,
          O.fold(
            () => {},
            (toSocket) => {    
              Debug(`[privateMessage - Right] Successfully get the socket`)  
              E.fold(
                () => {
                  event.message = "Sorry! Your message is blocked due to violation of policy"
                  fromSocket.emit(ChannelNames.chatroom, event)
                  Debug(`[privateMessage - Left] Improper message, converted event:`, event)
                },
                (converted: string) => {
                  Debug(`[privateMessage - Right] Converted message:${converted}`)
                  event.message = converted
                  toSocket.emit(ChannelNames.chatroom, event)
                  fromSocket.emit(ChannelNames.chatroom, event)
                }
              )(convertToValidMessage(event.message))
            }
          )
        )
      }
    )
  )
}

// public message
export const publicMessage = (server: Server, fromSocket:Socket, event: MessageEvent)  => {    
  E.fold(
    () => {
      Debug(`[publicMessage - Left] Received event`, event)
      event.message = "Sorry! Your message is blocked due to violation of policy"
      fromSocket.emit(ChannelNames.chatroom, event)
    },
    (converted: string) => {
      Debug(`[publicMessage - Right] Converted message:${converted}, Received event: `, event)
      event.message = converted
      server.emit(ChannelNames.chatroom, event)
    }
  )(convertToValidMessage(event.message))
}

// disconnect
export const disconnectChatroomBroadcastAll = (users: Record<string,User>, server: Server, fromSocketId:string, now: Date)  => {
  return pipe(
    Users.getFirstBySocketId(users, fromSocketId),
    O.chain(O.fromNullable),
    O.fold(
      () => users, 
      (user: User) => {
        Debug(`[disconnectChatroomBroadcastAll] User with ${fromSocketId} disconnects in:`, user)
        const message = `${user.name} left`
        const event: MessageEvent = {type: MessageTypes.leaveNotice, username: user.name, to: "", isPrivate: false, message: message, sentAt: now}
        server.emit(ChannelNames.chatroom, event)
        return Users.remove(users, user.name)
      }
    )
  )
}