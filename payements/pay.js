const helper = require('../utils/helper')

const pay = {
	_channels:{},
	init(){
		this._channels = helper.loadDirCls('./channels')
	},
	getPayement(channel){
		return this._channels[channel]
	}
}

module.exports = pay