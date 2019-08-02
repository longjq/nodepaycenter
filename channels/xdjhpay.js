const FormData = require('form-data');
const form = new FormData();
const got = require('got')

const helper = require('../utils/helper')

const xdjhpay = {
    async send(ctx, payement, order){
        // 拼接参数
        let comm = {}
        comm['fxid'] = payement['app_id']
        comm['fxddh'] = order['plat_order_id']
        comm['fxdesc'] = 'fppay'
        comm['fxfee'] = ~~(order['total_fee'] / 100);
        comm['fxnotifyurl'] = helper.hostUrl(ctx, '/api/v1/notify/'+order['plat_order_id'])
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
    async notify(ctx, order){
        // TBD
    },
    async sendurl(url, data = null, method = 'get'){
        url = 'http://localhost:4000/index.php'
        let params = []
        for (const key in data) {
            params.push(key+'='+data[key])
        }
        params = params.join('&')
        // console.log(data)
        // return [true, {'status':1,'data':data,'ss':url + '?' + data.join('&')}]
        try {
            let response = null
            if (method == 'get') {
                response = await got.get(url + '?' + params)
            }else{
                const form = new FormData();
                for (const key in data) {
                    form.append(key, data[key])
                }
                response = await got.post(url, {
                    body:form
                })
            }
            console.log('========>',response)
            return [true, response.body]
        } catch (error) {
            console.log(error)
            return [false, error]
        }
    },
    sign(data, appKey){
        return helper.mkmd5(data["fxid"] + data["fxddh"]  +  data["fxfee"] +  data["fxnotifyurl"]  +  appKey); //加密
    }
}

module.exports = xdjhpay