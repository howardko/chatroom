import {spy, assert, createSandbox} from "sinon"
// import {assert} from "chai"
import { Socket } from "socket.io";
import {expect} from "chai"
import {leaveChatroomBroadcastAll, disconnectChatroomBroadcastAll} from "./socket" 
import { MessageTypes } from "../type/message-type";
import { ChannelNames } from "../type/channel-name";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { User } from '../type/user';
import { Server } from "socket.io";
import {io} from 'socket.io-client'

describe('Test for socket services', function () {
    let outerSocket: Socket;
    let server:Server; 

    it('Should emit to all users when a user sends a leave notice', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          outerSocket = socket
          // console.log(`@@@@@@@@@${socket.id}`)
          let emit = spy(socket, 'emit')
          const event = {type: MessageTypes.leave_notice, username: "howard", toId: "", isPrivate: false, message: "leave", sentAt: new Date(Date.now())}
          leaveChatroomBroadcastAll(socket, event)
          assert.calledWith(emit, ChannelNames.chatroom, event);
          // console.log("####", event)
          emit.restore();
          done();
        });
        
        const client = io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
    });

    it('Should emit to all users when a user leaves', function (done) {
        server = new Server(3000);
        server.on(ChannelNames.connection, (socket) => {
          outerSocket = socket
          // console.log(`@@@@@@@@@${socket.id}`)
          socket.on(ChannelNames.disconnect, () => {
            const now = new Date(Date.now())
            const event = {type: MessageTypes.leave_notice, username: "Howard", toId: "", isPrivate: false, message: "Howard left", sentAt: now}
            const user1:User = {name: "Howard", socketId: socket.id}
            const user2:User = {name: "Mary", socketId: "whatever"}
            let emit = spy(outerSocket, 'emit')
            disconnectChatroomBroadcastAll(socket, { "Howard": user1, "Mary": user2}, now)
            assert.calledWith(emit, ChannelNames.chatroom, event);
            emit.restore();
          });
          done();
        });
        const client = io("http://localhost:3000", {
          transports: ["websocket", "polling"] 
        });
    });

    it('Should not emit to all users when a non-existed user leaves', function (done) {
      server = new Server(3000);
      server.on(ChannelNames.connection, (socket) => {
        outerSocket = socket
        // console.log(`@@@@@@@@@${socket.id}`)
        socket.on(ChannelNames.disconnect, () => {
          const now = new Date(Date.now())
          const event = {type: MessageTypes.leave_notice, username: "Howard", toId: "", isPrivate: false, message: "Howard left", sentAt: now}
          let emit = spy(outerSocket, 'emit')
          disconnectChatroomBroadcastAll(socket, {}, now)
          assert.notCalled(emit);
          emit.restore();
        });
        done();
      });
      const client = io("http://localhost:3000", {
        transports: ["websocket", "polling"] 
      });
  });

    afterEach(function (done) {
      if (outerSocket.connected) {
        outerSocket.disconnect()
      }
      server.close()
      done();
    });

});


// it('Should emit to all users when a user leaves', () => {
//   const server = new Server(3000);
//   let socketId = ""
//   server.on(ChannelNames.connection, (socket) => {
//     socketId = socket.id
//     console.log(`@@@@@@@@@${socket.id}`)
//     socket.on(ChannelNames.disconnect, () => {
//       const event = {type: MessageTypes.leave_notice, username: "howard", toId: "", isPrivate: false, message: "leave", sentAt: new Date(Date.now())}
//       const user1:User = {name: "Howard", socketId: socketId}
//       const user2:User = {name: "Mary", socketId: "whatever"}
//       let emit = spy(socket, 'emit')
//       console.log(`@@@@@@@@@111111${socket.id}`)
//       disconnectChatroomBroadcastAll(socket, { "Howard": user1, "Mary": user2} )
//       assert.calledWith(emit, ChannelNames.chatroom, {});
//       emit.restore();
//     })
//   });
  
//   const client = io("http://localhost:3000", {
//     transports: ["websocket", "polling"] 
//   });
//   client.disconnect()
//   // server.close()

// });