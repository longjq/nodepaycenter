const Router = require('koa-router');
const api = new Router()

const db = require('../utils/pool')
const helper = require('../utils/helper')
const loadDir = require('../utils/loaddir')

const IN_KEY = 'gebilaow'

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
    let sign = helper.sign(helper.postVals(data, helper.createOrderVals), memberRows[0]['app_key'])

    if (sign != data['sign']) {
        return ctx.response.body = {
            'code': -1,
            'msg': '签名异常'
        }
    }

    // 获取一个支付渠道
    let isVip = true
    let payements = await db.customPayement(data)
    if (payements.length <= 0) {
        isVip = false
        payements = await db.randomPayement(data)
        if (payements.length <= 0) {
            return ctx.response.body = {
                'code': -1,
                'msg': '没有配置支付渠道'
            }
        }
    }
    
    let payementPool = [];
    for (let idx in payements) {
        let item = payements[idx]
        if (item['limit_min'] <= data['amount'] && data['amount'] <= item['limit_max']){
            payementPool[idx] = item
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
    let result = await db.createOrder(data, payement, memberRows[0])
    // 创建订单成功
    if (result[0].insertId > 0) {
        signData = {}
        signData['memberid'] = data['memberid']
        signData['plat_order_id'] = result[1]
        signData['incr_id'] = result[0].insertId
        signData['is_vip'] = isVip
        signData['uxtime'] = ~~(new Date().getTime() / 1000)
        signData['name'] = payement['name']
        signData['sign'] = helper.sign(signData, IN_KEY)
        
        return ctx.response.body = {
            'code': 0,
            'msg': 'success',
            'data':{
                    'url': helper.hostUrl(ctx, '/api/v1/payement?' + helper.encodeData(signData, IN_KEY))
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
    let sign = helper.sign(helper.postVals(data, helper.sendPayementVals), IN_KEY)
    if (sign != data['sign']) {
        return ctx.response.body = {
            'code': -1,
            'msg': '签名异常'
        }
    }

    let orders = await db.queryOrder(data['plat_order_id'])
    if (orders.length <= 0) {
        return ctx.response.body = {
            'code': -1,
            'msg': '订单不存在'
        }
    }
    console.log('data===>',data);
    
    console.log('订单===》',orders)
    let payements = null
    if (data['is_vip'] === 'true') {
        payements = await db.queryVipPayement(orders[0])
    }else{
        payements = await db.queryPayement(orders[0])
    }
    
    if (!payements) {
        return ctx.response.body = {
            'code': -1,
            'msg': '订单异常'
        }
    }
    console.log(payements, orders)
    let payModules = loadDir('../channels')
    return await payModules[payements[0].name].send(ctx, payements[0], orders[0])
    
    
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