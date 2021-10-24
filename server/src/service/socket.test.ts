import { spy, assert } from "sinon"
import { expect } from "chai"
import { Socket, Server } from "socket.io";
import {io } from 'socket.io-client'
import { MessageTypes } from "../type/message-type";
import { MessageEvent } from "../model/message";
import { ChannelNames } from "../type/channel-name";
import { Command } from "../model/command";
import { CommandTypes } from "../type/command-type";
import { User } from '../model/user';

// test target
import { joinChatroomBroadcastAll, publicMessage, privateMessage, leaveChatroomBroadcastAll, disconnectChatroomBroadcastAll} from "./socket" 


describe('[socket] Tests for user connection', function () {
    let clientSocket: Socket;
    let server:Server; 
    let currentUsers: Record<string, User>;
    let testEvent: MessageEvent;

    beforeEach(function (done) {
      // default 
      currentUsers = {
        "Howard": {name: "Howard", socketId: "default"},
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

    it('1. Should emit to all users when receiving a user join notice', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        currentUsers = {}
        testEvent.message = "Howard joins"
        const emit = spy(server, 'emit')
        currentUsers = joinChatroomBroadcastAll(currentUsers, server, socket, testEvent)
        assert.calledWith(emit, ChannelNames.chatroom, testEvent);
        expect(currentUsers).to.eql({"Howard": {name: "Howard", socketId: socket.id}})
        emit.restore();
        console.log(`Should emit to all users when receiving a user join notice - updated users: `, currentUsers)
        done();
      });
      
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('2. Should emit to the origin user when there is an identical user name', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        testEvent.message = "Howard joins"
        const emit = spy(socket, 'emit')  
        const usersAfterAdd = joinChatroomBroadcastAll(currentUsers, server, socket, testEvent)
        const expectedReceivedCommand: Command = {
          type: CommandTypes.forcedLeave,
          to: "Howard",
          message: "Invalid user name or a user with the same name has already joined"
        }
        assert.calledWith(emit, ChannelNames.command, expectedReceivedCommand);
        expect(currentUsers).to.eql(usersAfterAdd)
        emit.restore();
        console.log(`Should emit to the origin user user when there is an identical user name - updated users: `, usersAfterAdd)
        done();
      });
      
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('3. Should emit to the origin user with empty user name when they try to join', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to the origin user with empty user name when they try to join from ${socket.id}`)
        clientSocket = socket
        testEvent.message = "joins"
        testEvent.username = ""
        const emit = spy(socket, 'emit')
        const usersAfterAdd = joinChatroomBroadcastAll(currentUsers, server, socket, testEvent)
        const expectedReceivedCommand: Command = {
          type: CommandTypes.forcedLeave,
          to: "",
          message: "Invalid user name or a user with the same name has already joined"
        }
        assert.calledWith(emit, ChannelNames.command, expectedReceivedCommand);
        expect(currentUsers).to.eql(usersAfterAdd)
        emit.restore();
        console.log(`Should emit to the origin user user when there is an identical user name - updated users: `, usersAfterAdd)
        done();
      });
      
      io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
    });

    it('4. Should emit to all users when receiving a user leave notice', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`Should emit to all users when receiving a user leave notice from ${socket.id}`)
          clientSocket = socket
          currentUsers["Howard"].socketId = socket.id
          const emit = spy(server, 'emit')
          currentUsers = leaveChatroomBroadcastAll(currentUsers, server, testEvent)
          assert.calledWith(emit, ChannelNames.chatroom, testEvent);
          expect(currentUsers).to.eql({"Christon": {name: "Christon", socketId: "watever"}})
          emit.restore();
          console.log(`Should emit to all users when receiving a user leave notice - updated users: `, currentUsers)
          done();
        });
        
        io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('5. Should emit to all users when a user leaves', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          console.log(`[User connects] Should emit to all users when a user leaves from ${socket.id}`)
          clientSocket = socket
          socket.on(ChannelNames.disconnect, () => {
            console.log(`[User disconnects] Should emit to all users when a user leaves from ${socket.id}`)
            currentUsers["Howard"].socketId = socket.id
            testEvent.message = "Howard left"
            const emit = spy(server, 'emit')
            currentUsers = disconnectChatroomBroadcastAll(currentUsers, server, socket.id, testEvent.sentAt)
            assert.calledWith(emit, ChannelNames.chatroom, testEvent);
            expect(currentUsers).to.eql({"Christon": {name: "Christon", socketId: "watever"}})
            emit.restore();
            console.log(`Should emit to all users when a user leaves - updated users: `, currentUsers)
          });
          done();
        });
        io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('6. Should not emit to all users when a non-existed user leaves', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User connects] Should not emit to all users when a non-existed user leaves from ${socket.id}`)
        clientSocket = socket
        socket.on(ChannelNames.disconnect, () => {
          console.log(`[User disconnects] Should not emit to all users when a non-existed user leaves from ${socket.id}`)
          currentUsers["Howard"].socketId = "another_id"
          const emit = spy(server, 'emit')
          const originUsers = currentUsers
          const actualUsers = disconnectChatroomBroadcastAll(currentUsers, server, socket.id, testEvent.sentAt)
          assert.notCalled(emit);
          expect(actualUsers).to.eql(originUsers)
          emit.restore();
          console.log(`Should not emit to all users when a non-existed user leaves - updated users: `, actualUsers)
        });
        done();
      });
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

});

describe('[Socket] Tests for user chat', function () {
    let clientSocket: Socket;
    let toSocket: Socket;
    let allConnectedClientSockets: Socket[];
    let server:Server;
    let currentUsers: Record<string, User>;
    let testEvent: MessageEvent;

    // after(function() {
    //   process.exit(0)
    // });

    beforeEach(function (done) {
      currentUsers = {
        "Howard": {name: "Howard", socketId: ""},
        "Christon": {name: "Christon", socketId: "watever"},
      }
      testEvent = {type: MessageTypes.leaveNotice, username: "Howard", to: "", isPrivate: false, message: "", sentAt: new Date(Date.now())}
      allConnectedClientSockets = []
      done();
    }),
    
    afterEach(function (done) {
      if (clientSocket != undefined && clientSocket.connected) {
        clientSocket.disconnect()
      }
      if (allConnectedClientSockets.length > 0) {
        for (const client of allConnectedClientSockets) {
          if (client.connected) {
            client.disconnect()
          }
        }
      }
      server.close()
      done();
    });

    it('1. Should emit to all users when receiving a valid public chat message from a user', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should emit to all users when receiving a user join notice from ${socket.id}`)
        clientSocket = socket
        testEvent.type = MessageTypes.chat
        testEvent.message = "Aloha"
        const emit = spy(server, 'emit')
        publicMessage(server, socket, testEvent)
        assert.calledWith(emit, ChannelNames.chatroom, testEvent);
        emit.restore();
        done();
      });
      
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('2. Should send warning message to the origin user when receiving an improper public chat message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving an improper public chat message from them from ${socket.id}`)
        clientSocket = socket
        testEvent.type = MessageTypes.chat
        testEvent.message = "dork! you idiot"
        const emit = spy(socket, 'emit')
        publicMessage(server, socket, testEvent)
        const expectedConvertedEvent = {type: MessageTypes.chat, username: "Howard", to: "", 
            isPrivate: false, message: "Sorry! Your message is blocked due to violation of policy", sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, expectedConvertedEvent);
        emit.restore();
        done();
      });
      
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });


    it('3. Should send warning message to the origin user when receiving a no to:user private message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving a no to:user private message from them from ${socket.id}`)
        clientSocket = socket
        testEvent.isPrivate = true
        testEvent.to = ""
        testEvent.type = MessageTypes.chat
        testEvent.message = "Hello everyone"
        const emit = spy(socket, 'emit')
        privateMessage(currentUsers, server, socket, testEvent)
        const expectedConvertedEvent = {type: MessageTypes.chat, username: "Howard", to: "", 
            isPrivate: true, message: `There is no such user:${testEvent.to}`, sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, expectedConvertedEvent);
        emit.restore();
        done();
      });
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

 
    it('4. Should send warning message to the origin user when receiving a non-existed to:user private message from them', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        console.log(`Should send warning message to the origin user when receiving a non-existed to:user private message from them from ${socket.id}`)
        clientSocket = socket
        testEvent.isPrivate = true
        testEvent.to = "not_existed_user"
        testEvent.type = MessageTypes.chat
        testEvent.message = "Hello everyone"
        const emit = spy(socket, 'emit')
        privateMessage(currentUsers, server, socket, testEvent)
        const expectedConvertedEvent = {type: MessageTypes.chat, username: "Howard", to: "not_existed_user", 
                              isPrivate: true, message: `There is no such user:${testEvent.to}`, sentAt: testEvent.sentAt}
        assert.calledWith(emit, ChannelNames.chatroom, expectedConvertedEvent);
        emit.restore();
        done();
      });
      io("http://localhost:3000", {transports: ["websocket", "polling"] });
    });

    it('5. Should successfully send private message', function (done) {
      server = new Server(3000);
      currentUsers = {}
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User Connected] Should successfully send private message from ${socket.id}`)
        const socketCnt = allConnectedClientSockets.length
        if (socketCnt == 0) {
          currentUsers["Howard"] = {name: "Howard", socketId: socket.id}
          socket.on(ChannelNames.chatroom, (event: MessageEvent) => {
            console.log(`[Chat] Should successfully send private message from ${socket.id}`)
            const emitChatFrom = spy(toSocket, 'emit')
            const emitChatTo = spy(socket, 'emit')
            privateMessage(currentUsers, server, socket, event)
            assert.calledWith(emitChatFrom, ChannelNames.chatroom, event);
            assert.calledWith(emitChatTo, ChannelNames.chatroom, event);
            emitChatFrom.restore();
            emitChatTo.restore();
            socket.disconnect()
            done();
          });
        }else if (socketCnt == 1) {
          toSocket = socket
          currentUsers["Christon"] = {name: "Christon", socketId: socket.id}
        }
        allConnectedClientSockets.push(socket)
      });
      
      const howardClient = io("http://localhost:3000", {transports: ["websocket", "polling"]});
      io("http://localhost:3000", {transports: ["websocket", "polling"]});
      const sentMessage:MessageEvent = {type: MessageTypes.chat, username: "Howard", to: "Christon", isPrivate: true, message: "I love you", sentAt: new Date(Date.now())}
      howardClient.emit(ChannelNames.chatroom, sentMessage) 
      done()
    });

    it('6. Should send warning message to the origin user when receiving a improper private message from them', function (done) {
      server = new Server(3000);
      currentUsers = {}
      server.on(ChannelNames.connection, (socket) => {
        console.log(`[User Connected] Should send warning message to the origin user when receiving a improper private message from them from ${socket.id}`)
        const socketCnt = allConnectedClientSockets.length
        if (socketCnt == 0) {
          currentUsers["Howard"] = {name: "Howard", socketId: socket.id}
          socket.on(ChannelNames.chatroom, (event: MessageEvent) => {
            console.log(`[Chat] Should send warning message to the origin user when receiving a improper private message from them from ${socket.id}`)
            const emit = spy(socket, 'emit')
            privateMessage(currentUsers, server, socket, event)
            const expectedConvertedEvent = {type: MessageTypes.chat, username: "Howard", to: "Amory", 
                              isPrivate: true, message: "Sorry! Your message is blocked due to violation of policy", sentAt: event.sentAt}
            assert.calledWith(emit, ChannelNames.chatroom, expectedConvertedEvent);
            emit.restore();
            socket.disconnect()
            done();
          });
        }else{
          currentUsers["Amory"] = {name: "Amory", socketId: socket.id}
        } 
        allConnectedClientSockets.push(socket)
      });
      
      const howardClient = io("http://localhost:3000", {transports: ["websocket", "polling"]});
      io("http://localhost:3000", {transports: ["websocket", "polling"]});
      const myMessage:MessageEvent = {type: MessageTypes.chat, username: "Howard", to: "Amory", isPrivate: true, message: "dork! stupid", sentAt: new Date(Date.now())}
      howardClient.emit(ChannelNames.chatroom, myMessage)
      done()
    });

});