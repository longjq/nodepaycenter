const Koa = require('koa')
const app = new Koa()

const api = require('./routers/api')

app.use(api.routes(), api.allowedMethods())

app.listen(3000, () => {
    console.log('server is running at http://0.0.0.0:3000')
})