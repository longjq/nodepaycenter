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
            return map[data['channel_shoptype_code']]
        })()
        comm['fxattch'] = order['member_user_id'];
        comm['fxip'] = order['client_ip'];
        // 生成md5的sign
        comm['fxsign'] = this.sign(comm, payement['app_key']);

        // 发送数据给远端
        
        // 判断结果，返回响应给客户端
    },
    async notify(ctx){

    },
    async sendData(url, data = null, method = null){

    },
    sign(data, sign){

    }
}

module.exports = xdjhpay