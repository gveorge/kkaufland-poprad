const mysql = require('mysql');

// Connection Pool
const pool = mysql.createPool({
    connectionLimit : 100,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_NAME,
});

exports.test = () => {
    // Test connection to database
    pool.getConnection((err, connection) => {
        if(err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);
        connection.release();
    });
}

exports.query = (query, variables, table, callback) => {
    pool.getConnection((err, connection) => {
        console.error(err); // not connected!
        console.log('Connected as ID ' + connection.threadId);
        connection.query(query, variables, (err, rows) => {
            // When done with the connection, release it
            connection.release();
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
            }
            console.log(`The data from ${table} table: \n`, rows);
        });
    });
}