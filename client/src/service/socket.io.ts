import SocketIO from 'socket.io-client'
export const SocketIOCon = (host: string) => SocketIO(host, {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
})