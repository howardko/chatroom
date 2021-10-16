import SocketIO from 'socket.io-client'
export const SocketIOCon = host => SocketIO(host, {
        withCredentials: true,
        extraHeaders: {
            "my-custom-header": "abcd"
        }
    })