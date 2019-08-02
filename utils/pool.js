const mysql = require('mysql2')
const helper = require('../utils/helper')

const pool = mysql.createPool({
	host: '119.23.29.164',
	user: 'gamer',
	password: 'btc!+ngkp',
    database: 'db_paycenter',
    port: 6006,
    debug: true,
    // trace:true
});
const promisePool = pool.promise();

const db = {
    async queryMember(memberid){
        const sql = 'select * from pay_member where id = ? and enabled = 1'
        const [rows, fields] = await promisePool.query(sql, memberid)
        return rows
    },
    async customPayement(data){
        const sql = 'select * from pay_member_channel_shoptype where enabled = 1 and member_id = ? and shoptype_code = ?'
        let s = promisePool.format(sql, [data['memberid'], data['shoptype']])
        const [rows, fields] = await promisePool.query(sql, [data['memberid'], data['shoptype']])
        return rows
    },
    async randomPayement(data){
        const sql = `select * from pay_channel_shoptype as cs,pay_channel as c 
                    where cs.channel_type = c.name
                    and c.enabled = 1 
                    and cs.shoptype_code = ?`
        const [rows, fields] = await promisePool.query(sql, data['shoptype'])
        return rows
    },
    async createOrder(data, payement, member){
        const platOrderId = helper.getOrderId(data['memberid'], data['userid'])
        const insertData = [data['memberid'],data['notifyurl'],data['orderid'],platOrderId, data['amount'],data['client_ip'],data['remark'],payement['name'],data['shoptype']]
        const sql = `insert into pay_order(
                        member_id,
                        member_notify_url,
                        orderid,
                        plat_order_id,
                        total_fee,
                        client_ip,
                        order_remark,
                        channel_type,
                        channel_shoptype_code) 
                    values(?,?,?,?,?,?,?,?,?)`
        const [rows, fields] = await promisePool.query(sql, insertData)
        return [rows, platOrderId]
    },
    async queryOrder(platOrderId){
        console.log('===========================>',platOrderId)
        const sql = 'select * from pay_order where plat_order_id = ?'
        const [rows, fields] = await promisePool.query(sql, platOrderId)
        return rows
    },
    async queryVipPayement(data){
        const sql = 'select * from pay_member_channel_shoptype where enabled = 1 and member_id = ? and shoptype_code = ? and name = ?'
        const [rows, fields] = await promisePool.query(sql, [data['member_id'], data['channel_shoptype_code'], data['channel_type']])
        return rows
    },
    async queryPayement(data){
        const sql = `select * from pay_channel_shoptype as cs,pay_channel as c 
                    where cs.channel_type = c.name
                    and c.enabled = 1 
                    and c.name = ?
                    and cs.shoptype_code = ?`
        const [rows, fields] = await promisePool.query(sql, [data['channel_type'], data['channel_shoptype_code']])
        return rows
    },
}

module.exports = db