import { Server, Socket } from "socket.io";
import { MessageEvent } from "../type/message";
import { MessageTypes } from "../type/message-type";
import { User } from '../type/user';
import {joinChatroomBroadcastAll, leaveChatroomBroadcastAll, privateMessage, publicMessage} from "../service/socket" 

const routeToHandler = (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent, handlers: {
  whenJoin: (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent) => Record<string, User>,
  whenLeave: (users: Record<string,User>, server: Server, event: MessageEvent) => Record<string, User>,
  whenPrivateMessage: (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent) => Record<string, User>,
  whenPublicMessage: (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent) => Record<string, User>,
}) => {
  switch (event.type) {
      case MessageTypes.chat:
          if (event.isPrivate){
              return handlers.whenPrivateMessage(users, server, fromSocket, event)
          }else{
              return handlers.whenPublicMessage(users, server, fromSocket, event)
          } 
      case MessageTypes.joinedNotice: return handlers.whenJoin(users, server, fromSocket, event)
      case MessageTypes.leaveNotice: return handlers.whenLeave(users, server, event)
      default:
          return users
  }
}

export const handle = (users: Record<string,User>, server: Server, fromSocket:Socket, event: MessageEvent) => {
  return routeToHandler(users, server, fromSocket, event, {
      whenJoin: joinChatroomBroadcastAll,
      whenLeave: leaveChatroomBroadcastAll,
      whenPrivateMessage: (users, server, fromSocket, event) => { 
          privateMessage(users, server, fromSocket, event)
          return users
      },
      whenPublicMessage: (users, server, fromSocket, event) => { 
          publicMessage(server, fromSocket, event)
          return users
      },
  })
}