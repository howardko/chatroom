import {stub, assert} from "sinon"
import { Socket, Server } from "socket.io";
import {io} from 'socket.io-client'
import * as SocketService from "../service/socket" 
import { MessageEvent } from "../model/message";
import { MessageTypes } from "../type/message-type";
import { ChannelNames } from "../type/channel-name";
import { User } from '../model/user';

// Test target
import {handle} from "./chatroom-handler" 
describe('[chatroom-handler] Tests for routing to hanlders based on event content', function () {
    let clientSocket: Socket;
    let server:Server; 
    let users: Record<string, User>;
    let testEvent: MessageEvent;

    beforeEach(function (done) {
      users = {}
      testEvent = {type: MessageTypes.joinedNotice, username: "", to: "", isPrivate: false, message: "", sentAt: new Date(Date.now())}
      done();
    }),

    afterEach(function (done) {
      if (clientSocket.connected) {
        clientSocket.disconnect()
      }
      server.close()
      done();
    });

    it('1. [chatroom-handler] should route to joinChatroomBroadcastAll handler', (done) => {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[chatroom-handler] should route to joinChatroomBroadcastAll handler, socket id ${socket.id}`)
          clientSocket = socket
          testEvent.type = MessageTypes.joinedNotice
          const whenJoin = stub(SocketService, 'joinChatroomBroadcastAll');
          handle(users, server, socket, testEvent)
          assert.called(whenJoin)
          whenJoin.restore()
          done()
        });
        
        io("http://localhost:3000", { transports: ["websocket", "polling"] });
    });
    
    it('2. [chatroom-handler] should route to leaveChatroomBroadcastAll handler', (done) => {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[chatroom-handler] should route to leaveChatroomBroadcastAll handler, socket id ${socket.id}`)
          clientSocket = socket
          testEvent.type = MessageTypes.leaveNotice
          const whenLeave = stub(SocketService, 'leaveChatroomBroadcastAll');
          handle(users, server, socket, testEvent)
          assert.called(whenLeave)
          whenLeave.restore()
          done()
        });
        
        io("http://localhost:3000", { transports: ["websocket", "polling"] });
    });

    it('3. [chatroom-handler] should route to publicMessage handler', (done) => {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[chatroom-handler] should route to publicMessage handler, socket id ${socket.id}`)
          clientSocket = socket
          testEvent.type = MessageTypes.chat
          testEvent.isPrivate = false
          const whenPublicMessage = stub(SocketService, 'publicMessage');
          handle(users, server, socket, testEvent)
          assert.called(whenPublicMessage)
          whenPublicMessage.restore()
          done()
        });
        
        io("http://localhost:3000", { transports: ["websocket", "polling"] });
    });

    it('4. [chatroom-handler] should route to privateMessage handler', (done) => {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[chatroom-handler] should route to privateMessage handler, socket id ${socket.id}`)
          clientSocket = socket
          testEvent.type = MessageTypes.chat
          testEvent.isPrivate = true
          const whenPrivateMessage = stub(SocketService, 'privateMessage');
          handle(users, server, socket, testEvent)
          assert.called(whenPrivateMessage)
          whenPrivateMessage.restore()
          done()
        });
        
        io("http://localhost:3000", { transports: ["websocket", "polling"] });
    });
});