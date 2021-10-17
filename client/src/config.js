export const port = parseInt(process.env.PORT, 10) || 3030;
const host = () => {
    if (process.env.HOST !== "") {
        return process.env.HOST
    }
    if (process.env.NODE_ENV === 'production') {
        const host = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
        return `${host}:${port}`
    }else{
        return `http://localhost:${port}`
    }
}
export const HOST = host()