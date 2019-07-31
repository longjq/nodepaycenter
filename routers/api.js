const Router = require('koa-router');
const api = new Router()

const db = require('../utils/pool')
const helper = require('../utils/helper')
const pay = require('../payements/pay')

api.get('/api/v1/order', async (ctx, next) => {
    let data = ctx.request.query
    
    // 商户id校验
    let memberid = data['memberid']
    if(!memberid){
        return ctx.response.body = {
            'code':-1,
            'msg':'memberid必传'
        }
    }

    // 商户查询
    let memberRows = await db.queryMember(memberid)
    if (memberRows.length <= 0) {
        return ctx.response.body = {
            'code': -1,
            'msg': '商户异常'
        }
    }

    // 签名处理
    let sign = helper.sign(helper.postVals(data, helper.signVals), memberRows[0]['app_key'])
    if (sign != data['sign']) {
        return ctx.response.body = {
            'code': -1,
            'msg': '签名异常'
        }
    }

    // 获取一个支付渠道
    let payements = await db.customPayement(data)
    let randomPayements = []
    if (payements.length <= 0) {
        randomPayements = await db.randomPayement(data)
    }
    if (randomPayements.length <= 0) {
        return ctx.response.body = {
            'code': -1,
            'msg': '没有配置支付渠道'
        }
    }

    let payementPool = [];
    for (let item in randomPayements) {
        if (item['limit_min'] <= data['amount'] && data['amount'] <= item['limit_max']){
            payementPool[payementPool.length - 1] = item
        }
    }

    if (payementPool.length <= 0) {
        return ctx.response.body = {
            'code': -1,
            'msg': '支付金额没有匹配的支付渠道'
        }
    }

    let payement = payementPool[Math.floor(Math.random()*payementPool.length)];

    // 保存订单和支付渠道信息
    let orderResult = await db.createOrder(data, payement, memberRows[0])

    // 创建订单成功
    if (orderResult[0]) {
        return ctx.response.body = {
            'code': 0,
            'msg': 'success',
            'data':{
                    'url':orderResult[1]
            }
        }
    }

    // 创建订单失败
    return ctx.response.body = {
        'code': -1,
        'msg': '操作失败',
    }

    // ctx.response.status = 200
    // ctx.response.body = 'success'
    // await next()
})

api.get('/api/v1/payement', async (ctx, next) => {
    let data = ctx.request.query

    // 商户id校验
    let memberid = data['memberid']
    if(!memberid){
        return ctx.response.body = {
            'code':-1,
            'msg':'缺少商户ID'
        }
    }

    // 商户查询
    let memberRows = await db.queryMember(memberid)
    if (memberRows.length <= 0) {
        return ctx.response.body = {
            'code': -1,
            'msg': '商户异常'
        }
    }

    // 签名处理
    let sign = helper.sign(helper.postVals(data, helper.signVals), memberRows[0]['app_key'])
    if (sign != data['sign']) {
        return ctx.response.body = {
            'code': -1,
            'msg': '签名异常'
        }
    }

    let order = await db.queryOrder(data['plat_order_id'])
    let payementConfig = await db.queryPayement(data)
    

    // ctx.response.status = 200
    // ctx.response.body = 'payement'
    // await next()
})

api.get('/api/v1/notify/:channel', async (ctx, next) => {
    console.log(ctx.params);
    ctx.response.status = 200
    ctx.response.body = ctx.params['channel']
    await next()
})

module.exports = api