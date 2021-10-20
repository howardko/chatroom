import express from 'express';
import path from 'path';
import { createServer } from "http";
import { Server } from "socket.io";
import { MessageEvent, ChatBoardMessage } from "./types/message";
import { ChannelNames } from "./types/channel-names";
import { MessageTypes } from "./types/message-types";
import { appConfigs } from "./config/config";

const configs = appConfigs(process.env);

// console.log(configs);
const app = express();
const httpServer = createServer({}, app);

// const port = parseInt(process.env.PORT as string, 10) || 8080;
const io: Server = process.env.NODE_ENV === "development" ? new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
}) : new Server(httpServer, {
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

let onlineCount: number = 0
io.on(ChannelNames.connection, (socket) => {
    console.log(`user connected with socket id:${socket.id}`);
    onlineCount += 1
    console.log(`Someone just joined. There are ${onlineCount} people online`)
    socket.on(ChannelNames.messageFromUser, function (event: MessageEvent) {
        if(event.type == MessageTypes.leave_notice){
            socket.broadcast.emit(ChannelNames.chatroom, event)
            console.log("server sends to all except the sender")
        }else{
            io.emit(ChannelNames.chatroom, event)
            console.log("server sends to all")
        }
        console.log(event)
    })

    socket.on(ChannelNames.disconnect, (reason) => {
        onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
        io.emit(ChannelNames.onlineCount, onlineCount);
        console.log(`Someone just left with socket id:${socket.id} because of ${reason}. There are ${onlineCount} people online`)
    });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname)));
    app.get('/', (_, res) => {
        console.log("a user connected to get index")
        const indexFile = path.join(__dirname, './index.html')
        res.sendFile(indexFile);
    });
}

httpServer.listen(configs.PORT, function () {
    console.log('Express Http Server is listening on *:' + configs.PORT);
});