import express from 'express';
import path from 'path';
import { createServer } from "http";
import { Server } from "socket.io";
import { MessageEvent } from "./type/message";
import { ChannelNames } from "./type/channel-name";
import { EnvironmentTypes } from "./type/environment-type";
import { appConfigs} from "./config/config";
import { Debug, Info } from "./utility/log";
import { User } from './type/user';
import { Users } from "./store/user" 
import { disconnectChatroomBroadcastAll } from "./service/socket" 
import { handle } from "./handler/chatroom-handler" 

const configs = appConfigs();
const httpRouter = express();
const httpServer = createServer({}, httpRouter);

const server: Server = configs.NODE_ENV === EnvironmentTypes.development ? 
    new Server(httpServer, {
        cors: {
            origin: "http://localhost:8081",
            methods: ["GET", "POST"],
            // allowedHeaders: ["my-custom-header"],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
    }) 
    : new Server(httpServer, {
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

let users: Record<string, User> = {}
server.on(ChannelNames.connection, (fromSocket) => {
    Info(`A connection is set up with socket id:${fromSocket.id}.`)
    fromSocket.on(ChannelNames.chatroom, function (event: MessageEvent) {
       users = handle(users, server, fromSocket, event)
       Info(`${event.username} just joined with socket id:${fromSocket.id}. There are ${Users.userCount(users)} people online`)
    })

    fromSocket.on(ChannelNames.disconnect, (reason) => {
        users = disconnectChatroomBroadcastAll(users, server, fromSocket.id, new Date(Date.now()))
        Debug(`A connection is drop with socket id:${fromSocket.id} because of ${reason}. There are ${Users.userCount(users)} people online`)
    });
});

httpRouter.use(express.static(path.join(__dirname)));
httpRouter.get('/', (_, res) => {
    Debug("A user connected to get index")
    const indexFile = path.join(__dirname, './index.html')
    res.sendFile(indexFile);
});

httpServer.listen(configs.PORT, function () {
    Info('Express Http Server is listening on *:' + configs.PORT);
});