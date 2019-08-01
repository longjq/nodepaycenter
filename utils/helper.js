const crypto = require('crypto');

const helper = {
  createOrderVals:[
    'memberid',
    'userid',
    'client_ip',
    'amount',
    'orderid',
    'timestamp',
    'notifyurl',
    'paytype',
    'sign',
    'shoptype',
    'remark'
  ],
  sendPayementVals:[
    'plat_order_id',
    'incr_id',
    'memberid',
    'uxtime',
    'name',
    'is_vip',
    'sign'
  ],
  encodeData(data, appKey){
    let tmps = []
    for (const key in data) {
      tmps.push(key + '=' + data[key]);  
    }
    tmps['key'] = this.sign(data, appKey)

    return tmps.join('&')
  },
  postVals(data, vals = []){
    let postData = {}
    for (const val of vals) {
      if (val in data) {
        postData[val] = data[val]
      }
    }
    if (!postData) {
      postData = data
    }
    return postData
  },
  getOrderId(memberid, userid){
    return ~~(new Date().getTime() / 1000) + this.randomRange(100,999) + memberid + userid
  },
  randomRange(min,max){
    return Math.floor(Math.random() * (max - min) + min);
  },
  sign(data, appKey){
    return this.mkmd5(this._mkQueryString(data, appKey))
  },
  _mkQueryString(data, appKey){
    if ('sign' in data) {
      delete data['sign']
    }

    let sortKey = Object.keys(data).sort()
    let newSort = []
    for (let index = 0; index < sortKey.length; index++) {
       newSort[sortKey[index]] = data[sortKey[index]];
    }

    let tmps = []
    for (const key in newSort) {
      tmps.push(key + '=' + newSort[key]);  
    }
    tmps['key'] = appKey

    return tmps.join('&')
  },
  mkmd5(sourceStr){
    return crypto.createHash('md5').update(sourceStr).digest('hex')
  },
  hostUrl(ctx, url){
    return this.hostDomain(ctx) + url
  },
  hostDomain(ctx){
    return ctx.request.protocol + '://'+ ctx.request.host
  }
}

module.exports = helper