const got = require('got')
const helper =require('../utils/helper')

const xdjhpay = {
    async send(ctx, payement, order){
        // 拼接参数
        let comm = {}
        comm['fxid'] = payement['app_id']
        comm['fxddh'] = order['plat_order_id']
        comm['fxdesc'] = 'fppay'
        comm['fxfee'] = ~~(order['total_fee'] / 100);
        comm['fxnotifyurl'] = helper.hostUrl(ctx, '/api/v1/notify/'+order['channel_type'])
        comm['fxbackurl'] = ''
        comm['fxpay'] = (()=>{
            let map = {
                '101' : 'zfbwap',
                '102' : 'zfbewm',
                '103' : 'wxkjwm',
                '104' : 'wxewm',
                '110' : 'ylewm',
            }
            return map[order['channel_shoptype_code']]
        })()
        comm['fxattch'] = order['member_user_id'];
        comm['fxip'] = order['client_ip'];
        // 生成md5的sign
        comm['fxsign'] = this.sign(comm, payement['app_key']);

        // 发送数据给远端
        let result = await this.sendurl(payement['send_url'], comm, 'post')
        
        // 判断结果，返回响应给客户端
        if (result[0] === false) {
            return ctx.response.body = {
                'code':-1,
                'msg':result[1]
            }
        }

        // 三方成功响应
        if (result[1]['status']) {
            ctx.response.status = 200
            return ctx.response.body = {
                'code':0,
                'msg':result
            }
            // return ctx.response.redirect(result[1]['payurl'])
        }else{
            ctx.response.status = 200
            return ctx.response.body = {
                'code':-1,
                'msg':result[1]['error']
            }
        }
    },
    async notify(ctx){

    },
    async sendurl(url, data = null, method = 'get'){

        return [true, {'status':1,'data':data}]
        try {
            let response = null
            if (method == 'get') {
                response = await got.get(url + '?' + data.join('&'))
            }else{
                response = await got.post(url, {
                    body:data
                })
            }
            return [true, response.body]
        } catch (error) {
            return [false, error.response.body]
        }
    },
    sign(data, appKey){
        return helper.mkmd5(data["fxid"] + data["fxddh"]  +  data["fxfee"] +  data["fxnotifyurl"]  +  appKey); //加密
    }
}

module.exports = xdjhpay