const Router = require('koa-router');
const api = new Router()

const db = require('../utils/pool')

api.get('/api/v1/order', async (ctx, next) => {
    let userinfo = await db.userinfo()
    ctx.response.status = 200
    ctx.response.body = userinfo
    await next()
})

api.get('/api/v1/payement', async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.body = 'payement'
    await next()
})

api.get('/api/v1/notify/:channel', async (ctx, next) => {
    console.log(ctx.params);
    ctx.response.status = 200
    ctx.response.body = ctx.params['channel']
    await next()
})

module.exports = api