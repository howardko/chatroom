const port = parseInt(process.env.PORT, 10) || 8080;

const host = ():string => {
    if (process.env.NODE_ENV === 'production') {
        return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
    }
    return `http://localhost:${port}`
}

export const HOST = host()