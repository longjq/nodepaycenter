const crypto = require('crypto');

const helper = {
  signVals:[
    'memberid',
    'client_ip',
    'amount',
    'orderid',
    'timestamp',
    'notifyurl',
    'paytype',
    'sign',
    'remark'
  ],
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
  }
}

module.exports = helper