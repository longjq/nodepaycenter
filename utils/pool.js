const mysql = require('mysql2')
const helper = require('../utils/helper')

const pool = mysql.createPool({
	host: 'vr3dw.com',
	user: 'root',
	password: 'Long1990',
    database: 'demo',
    port: 8999
});
const promisePool = pool.promise();

const db = {
    async queryMember(memberid){
        const sql = 'select * from pay_member where memberid = ? and enabled = 1'
        const [rows, fields] = await promisePool.query(sql, memberid)
        return rows
    },
    async customPayement(data){
        const sql = 'select * from pay_member_channel_shoptype where member_id = ? and shoptype = ?'
        const [rows, fields] = await promisePool.query(sql, [data['memberid'], data['shoptype']])
        return rows
    },
    async randomPayement(data){
        const sql = `select * from pay_channel_shoptype as cs,pay_channel as c 
                    where cs.pay_channel = c.id
                    shoptype = ?`
        const [rows, fields] = await promisePool.query(sql, data['shoptype'])
        return rows
    },
    async createOrder(data){
        const insertData = [data['app_id'],data['notifyurl'],data['orderid'],helper.getOrderId(), data['amount'],data['client_ip'],data['remark'],data['name'],data['shoptype'],data['shoptype'],~~Date.now() / 1000]
        const sql = `insert into pay_order(member_id,notify_url,orderid,plat_order_id,total_fee,client_ip,order_remark,channel_type,channel_shoptype,created_at) 
                    values(?,?,?,?,?,?,?,?,?,?)`
        const [rows, fields] = await promisePool.query(sql, insertData)
        return rows
    }
}

module.exports = db