import {spy, assert} from "sinon"
import { Socket } from "socket.io";
import {expect} from "chai"
import { joinChatroomBroadcastAll, publicMessage, privateMessage, leaveChatroomBroadcastAll, disconnectChatroomBroadcastAll} from "./socket" 
import { MessageTypes } from "../type/message-type";
import { MessageEvent } from "../type/message";
import { ChannelNames } from "../type/channel-name";
import { Command } from "../type/command";
import { CommandTypes } from "../type/command-type";
import { User } from '../type/user';
import { Server } from "socket.io";
import {io} from 'socket.io-client'


describe('Tests for user connection', function () {
    let clientSocket: Socket;
    let server:Server; 
    let users: Record<string, User>;
    let testEvent: MessageEvent;

    beforeEach(function (done) {
      users = {
        "Howard": {name: "Howard", socketId: ""},
        "Christon": {name: "Christon", socketId: "watever"},
      }
      testEvent = {type: MessageTypes.leaveNotice, username: "Howard", to: "", isPrivate: false, message: "Howard leaves", sentAt: new Date(Date.now())}
      done();
    }),

    afterEach(function (done) {
      if (clientSocket.connected) {
        clientSocket.disconnect()
      }
      server.close()
      done();
    });

    it('Should emit to all users when receiving a user join notice', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        users = {}
        const emit = spy(server, 'emit')
        testEvent.message = "Howard joins"
        users = joinChatroomBroadcastAll(users, server, socket, testEvent)
        assert.calledWith(emit, ChannelNames.chatroom, testEvent);
        expect(users).to.eql({"Howard": {name: "Howard", socketId: socket.id}})
        emit.restore();
        // console.log(`Should emit to all users when receiving a user join notice - updated users: `, users)
        done();
      });
      
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });

    it('Should emit to the origin user user when there is an identical user name', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        const emit = spy(socket, 'emit')
        testEvent.message = "Howard joins"
        const receivedCommand: Command = {
          type: CommandTypes.forcedLeave,
          to: "Howard",
          message: "Invalid user name or a user with the same name has already joined"
        }
        const usersAfterAdd = joinChatroomBroadcastAll(users, server, socket, testEvent)
        assert.calledWith(emit, ChannelNames.command, receivedCommand);
        expect(users).to.eql(usersAfterAdd)
        emit.restore();
        console.log(`Should emit to the origin user user when there is an identical user name - updated users: `, usersAfterAdd)
        done();
      });
      
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });


    it('Should emit to all users when receiving a user leave notice', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`Should emit to all users when receiving a user leave notice from ${socket.id}`)
          clientSocket = socket
          users["Howard"].socketId = socket.id
          const emit = spy(server, 'emit')
          users = leaveChatroomBroadcastAll(users, server, testEvent)
          assert.calledWith(emit, ChannelNames.chatroom, testEvent);
          expect(users).to.eql({"Christon": {name: "Christon", socketId: "watever"}})
          emit.restore();
          console.log(`Should emit to all users when receiving a user leave notice - updated users: `, users)
          done();
        });
        
        io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
    });

    it('Should emit to all users when a user leaves', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[User connects] Should emit to all users when a user leaves from ${socket.id}`)
          clientSocket = socket
          socket.on(ChannelNames.disconnect, () => {
            console.log(`[User disconnects] Should emit to all users when a user leaves from ${socket.id}`)
            users["Howard"].socketId = socket.id
            testEvent.message = "Howard left"
            const emit = spy(server, 'emit')
            users = disconnectChatroomBroadcastAll(users, server, socket.id, testEvent.sentAt)
            assert.calledWith(emit, ChannelNames.chatroom, testEvent);
            expect(users).to.eql({"Christon": {name: "Christon", socketId: "watever"}})
            emit.restore();
            console.log(`Should emit to all users when a user leaves - updated users: `, users)
          });
          done();
        });
        io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
        //delay(1000)
        // if (clientSocket.connected) {
        //   console.log("HERE3")
        //   clientSocket.disconnect()
        // }
    });

    it('Should not emit to all users when a non-existed user leaves', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User connects] Should not emit to all users when a non-existed user leaves from ${socket.id}`)
        clientSocket = socket
        socket.on(ChannelNames.disconnect, () => {
          console.log(`[User disconnects] Should not emit to all users when a non-existed user leaves from ${socket.id}`)
          users["Howard"].socketId = "another_id"
          const emit = spy(server, 'emit')
          const originUsers = users
          users = disconnectChatroomBroadcastAll(users, server, socket.id, testEvent.sentAt)
          assert.notCalled(emit);
          expect(users).to.eql(originUsers)
          emit.restore();
          console.log(`Should not emit to all users when a non-existed user leaves - updated users: `, users)
        });
        done();
      });
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });

});


describe('Tests for user chat', function () {
    let clientSocket: Socket;
    let toSocket: Socket;
    const allSockets: Socket[] = []
    let server:Server; 
    let users: Record<string, User>;
    let testEvent: MessageEvent;

    beforeEach(function (done) {
      // server = new Server(3000);
      users = {
        "Howard": {name: "Howard", socketId: ""},
        "Christon": {name: "Christon", socketId: "watever"},
      }
      testEvent = {type: MessageTypes.leaveNotice, username: "Howard", to: "", isPrivate: false, message: "", sentAt: new Date(Date.now())}
      done();
    }),
    
    afterEach(function (done) {
      if (clientSocket != undefined && clientSocket.connected) {
        clientSocket.disconnect()
      }
      if (allSockets.length > 0) {
        for (const client of allSockets) {
          if (client.connected) {
            client.disconnect()
          }
        }
      }
      server.close()
      done();
    });

    
    it('Should emit to all users when receiving a valid public chat message from a user', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        users = {}
        const emit = spy(server, 'emit')
        testEvent.type = MessageTypes.chat
        testEvent.message = "Aloha"
        publicMessage(server, socket, testEvent)
        assert.calledWith(emit, ChannelNames.chatroom, testEvent);
        emit.restore();
        done();
      });
      
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });

    it('Should send warning message to the origin user when receiving an improper public chat message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving an improper public chat message from them from ${socket.id}`)
        clientSocket = socket
        users = {}
        const emit = spy(socket, 'emit')
        testEvent.type = MessageTypes.chat
        testEvent.message = "dork! you idiot"
        publicMessage(server, socket, testEvent)
        const converted = {type: MessageTypes.chat, username: "Howard", to: "", 
            isPrivate: false, message: "Sorry! Your message is blocked due to violation of policy", sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, converted);
        emit.restore();
        done();
      });
      
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });


    it('Should send warning message to the origin user when receiving a no to:user private message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving a no to:user private message from them from ${socket.id}`)
        clientSocket = socket
        const emit = spy(socket, 'emit')
        testEvent.isPrivate = true
        testEvent.to = ""
        testEvent.type = MessageTypes.chat
        testEvent.message = "Hello everyone"
        privateMessage(users, server, socket, testEvent)
        const converted = {type: MessageTypes.chat, username: "Howard", to: "", 
            isPrivate: true, message: `There is no such user:${testEvent.to}`, sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, converted);
        emit.restore();
        done();
      });
      io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
    });

 
    it('Should send warning message to the origin user when receiving a non-existed to:user private message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving a non-existed to:user private message from them from ${socket.id}`)
        clientSocket = socket
        const emit = spy(socket, 'emit')
        testEvent.isPrivate = true
        testEvent.to = "not_existed_user"
        testEvent.type = MessageTypes.chat
        testEvent.message = "Hello everyone"
        privateMessage(users, server, socket, testEvent)
        const converted = {type: MessageTypes.chat, username: "Howard", to: "not_existed_user", 
                              isPrivate: true, message: `There is no such user:${testEvent.to}`, sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, converted);
        emit.restore();
        done();
      });
      io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
    });

    it('Should successfully send private message', function (done) {
      server = new Server(3000);
      users = {}
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User Connected] Should successfully send private message from ${socket.id}`)
        const socketCnt = allSockets.length
        if (socketCnt == 0) {
          users["Howard"] = {name: "Howard", socketId: socket.id}
          socket.on(ChannelNames.chatroom, (event: MessageEvent) => {
            console.log(`[Chat] Should successfully send private message from ${socket.id}`)
            const emitChatFrom = spy(toSocket, 'emit')
            const emitChatTo = spy(socket, 'emit')
            privateMessage(users, server, socket, event)
            assert.calledWith(emitChatFrom, ChannelNames.chatroom, event);
            assert.calledWith(emitChatTo, ChannelNames.chatroom, event);
            emitChatFrom.restore();
            emitChatTo.restore();
            done();
          });
        }else if (socketCnt == 1) {
          toSocket = socket
          users["Christon"] = {name: "Christon", socketId: socket.id}
        }
        allSockets.push(socket)
      });
      
      const howardClient = io("http://localhost:3000", {transports: ["websocket", "polling"]});
      io("http://localhost:3000", {transports: ["websocket", "polling"]});
      const myMessage:MessageEvent = {type: MessageTypes.chat, username: "Howard", to: "Christon", isPrivate: true, message: "I love you", sentAt: new Date(Date.now())}
      howardClient.emit(ChannelNames.chatroom, myMessage) 
    });

    
    it('Should send warning message to the origin user when receiving a improper private message from them', function (done) {
      server = new Server(3000);
      users = {}
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User Connected] Should send warning message to the origin user when receiving a improper private message from them from ${socket.id}`)
        const socketCnt = allSockets.length
        if (socketCnt == 0) {
          users["Howard"] = {name: "Howard", socketId: socket.id}
          socket.on(ChannelNames.chatroom, (event: MessageEvent) => {
            console.log(`[Chat] Should send warning message to the origin user when receiving a improper private message from them from ${socket.id}`)
            const emit = spy(socket, 'emit')
            privateMessage(users, server, socket, event)
            const converted = {type: MessageTypes.chat, username: "Howard", to: "Amory", 
                              isPrivate: true, message: "Sorry! Your message is blocked due to violation of policy", sentAt: event.sentAt}
            assert.calledWith(emit, ChannelNames.chatroom, converted);
            emit.restore();
            done();
          });
        }else{
          users["Amory"] = {name: "Amory", socketId: socket.id}
        } 
        allSockets.push(socket)
      });
      
      const howardClient = io("http://localhost:3000", {transports: ["websocket", "polling"]});
      io("http://localhost:3000", {transports: ["websocket", "polling"]});
      const myMessage:MessageEvent = {type: MessageTypes.chat, username: "Howard", to: "Amory", isPrivate: true, message: "dork! stupid", sentAt: new Date(Date.now())}
      howardClient.emit(ChannelNames.chatroom, myMessage) 
    });

});
