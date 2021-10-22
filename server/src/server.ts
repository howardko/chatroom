import express from 'express';
import path from 'path';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { MessageEvent } from "./type/message";
import { ChannelNames } from "./type/channel-name";
import { MessageTypes } from "./type/message-type";
import { EnvironmentTypes } from "./type/environment-type";
import { appConfigs } from "./config/config";
import { Debug, Info } from "./utility/log";
import { User } from './type/user';
import { right, left, Either } from "fp-ts/lib/Either"

const configs = appConfigs();
const app = express();
const httpServer = createServer({}, app);

const io: Server = configs.NODE_ENV === EnvironmentTypes.DEVELOPMENT ? new Server(httpServer, {
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
let users: Record<string, User> = {}

io.on(ChannelNames.connection, (socket) => {
    const id = socket.id
    onlineCount += 1
    Info(`Someone just joined with socket id:${id}. There are ${onlineCount} people online`)

    socket.on(ChannelNames.messageFromUser, function (event: MessageEvent) {
        if(event.type == MessageTypes.joined_notice){
            // add user
        }
        if(event.type == MessageTypes.leave_notice){
            socket.broadcast.emit(ChannelNames.chatroom, event)
        }else{
            if (event.isPrivate && event.toId != ""){
                const toSocket = io.sockets.sockets.get(event.toId)
                if (toSocket != undefined) {
                    toSocket.emit(ChannelNames.chatroom, event)
                }
            }else{
                io.emit(ChannelNames.chatroom, event)
            }
        }
        console.log(event)
    })

    socket.on(ChannelNames.disconnect, (reason) => {
        onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
        io.emit(ChannelNames.onlineCount, onlineCount);
        Debug(`Someone just left with socket id:${socket.id} because of ${reason}. There are ${onlineCount} people online`)
    });
});

// if (configs.NODE_ENV === EnvironmentTypes.PRODUCTION) {
//     app.use(express.static(path.join(__dirname)));
//     app.get('/', (_, res) => {
//         Debug("A user connected to get index")
//         const indexFile = path.join(__dirname, './index.html')
//         res.sendFile(indexFile);
//     });
// }

app.use(express.static(path.join(__dirname)));
app.get('/', (_, res) => {
    Debug("A user connected to get index")
    const indexFile = path.join(__dirname, './index.html')
    res.sendFile(indexFile);
});
app.get('/online_users', (_, res) => {
    
    
});

// function listOnlineUsers(): Either<Error, string[]> {
//     Debug("List online users")
//     return users
//       ? right(generateToken(email))
//       : left(new Error("bad credentials"))
//   }

httpServer.listen(configs.PORT, function () {
    Info('Express Http Server is listening on *:' + configs.PORT);
});