import mysql from 'mysql'

class mysqlProvider {
    runQuery (sql, params = [], single = false) {
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })


        return new Promise((resolve, reject) => {
                connection.query(sql, params, (err, results) => {
                if(err) {
                    console.log(err);
                    console.log('something went wront');
                }
                let returnedResult = []

                if (single) {
                    returnedResult = {}
                }

                if (results !== undefined && results.length) {
            returnedResult = results
            if (single) {
                returnedResult = results[0]
            }
        }

        resolve(returnedResult)
        connection.end();
    })
    })
    }

    async findOneByColumn (table, column, value) {
    const sql = 'select * from ' + table + ' where ' + column + ' = ? limit 1'

    return this.runQuery(sql, [value], 1)
}

    update (table, changes, where) {
        var totalSearchClause = Object.keys(where).length;

        let sql = `update ${table} set ? where ?`

        if(totalSearchClause > 1) {
            var newWhereClause = [];
            for (var key in where) {
                newWhereClause.push({[key]:where[key]});
            }
            sql = `update ${table} set ? where ? and ?`

            return this.runQuery(sql, [changes, newWhereClause[0], newWhereClause[1]])
        }

        return this.runQuery(sql, [changes, where])
    }

    statement (sql,singleRow = false) {
        return this.runQuery(sql,[],singleRow)
    }
}

export default mysqlProvider
