const port = parseInt(process.env.PORT, 10) || 8080;

const host = ():string => {
    if (process.env.NODE_ENV === 'production') {
        return `https://howard-simple-chatroom.herokuapp.com`
    }
    return `http://localhost:${port}`
}

export const HOST = host()