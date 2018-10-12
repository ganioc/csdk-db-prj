import { LocalDB, IfDBOptions } from '../lib/core/db/localdatabase';
import { ErrorCode } from '../lib/core/error_code'
import { clerror, clinfo, clmark } from '../lib/core/tools/formator';
import * as sqlite from 'sqlite3';
sqlite.verbose();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('testdb.db');

// db.serialize(function () {
//     db.run("CREATE TABLE lorem (info TEXT)");

//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", (err: any, row: any) => {
//         console.log(row.id + ": " + row.info);
//     });
// });

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS "Tiger" (name TEXT NOT NULL UNIQUE);');
    db.run('INSERT INTO Tiger (name) VALUES ( $value )', { $value: "mouse" });
    db.each('SELECT rowid AS id , name from Tiger', (err: any, row: any) => {
        console.log(row.id + ':' + row.name)
    })
});

db.close();

