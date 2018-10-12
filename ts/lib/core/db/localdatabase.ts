/**
 * 封装底层的database的实现
 * 数据库的名字 文件
 * 表的名字，里面的表
 */
import * as sqlite from 'sqlite3';
import { cl, clinfo, clerror } from '../tools/formator';
import { ErrorCode } from '../error_code';

sqlite.verbose(); // to print trace logs

export interface IfDBTableOptions {
    name: string;
}

export interface IfDBOptions {
    name: string;
    tables: string[];
}

export class LocalDBTable {
    private name: string;
    constructor(options: IfDBTableOptions) {
        this.name = options.name;
    }
    init() {

    }
}
/**
 * 数据库里包含表，这样更加自然一些
 */
export class LocalDB {
    private name: string;
    private db: sqlite.Database;
    private tables: LocalDBTable[];

    constructor(options: IfDBOptions) {
        this.name = options.name;
        this.db = Object.create(null);
        this.tables = [];
    }
    open(): Promise<ErrorCode> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite.Database(this.name, (err) => {
                if (err) {
                    clerror('Fail to open db:', this.name);
                    reject(ErrorCode.RESULT_FAILED);
                } else {
                    resolve(ErrorCode.RESULT_OK);
                }

            });
        });
    }
    openTable(nameTable: string): Promise<ErrorCode> {
        return new Promise((resolve, reject) => {
            this.db.run('CREATE TABLE IF NOT EXISTS $table ( name CHAR(64) NOT NULL);',
                {
                    $table: nameTable,
                },
                (err) => {
                    if (err) {
                        console.log(err);
                        Promise.reject(ErrorCode.RESULT_FAILED);
                    } else {
                        Promise.resolve(ErrorCode.RESULT_OK);
                    }
                });
        });
    }
    insertToTable(nameTable: string, name: string): Promise<ErrorCode> {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO $table (name) VALUES ($name);',
                {
                    $table: nameTable,
                    $name: name,
                },
                (err) => {
                    if (err) {
                        reject(ErrorCode.RESULT_FAILED);
                    } else {
                        resolve(ErrorCode.RESULT_OK);
                    }
                });
        });
    }
    readTable(nameTable: string): Promise<ErrorCode> {
        return new Promise((resolve, reject) => {
            this.db.run('SELECT * from $table;',
                {
                    $table: nameTable,
                },
                (err: any, rows: any) => {
                    if (err) {
                        reject(ErrorCode.RESULT_FAILED);
                    } else {
                        cl(rows);
                        resolve(ErrorCode.RESULT_OK);
                    }
                });
        });
    }
    close(): Promise<ErrorCode> {
        return new Promise((resolve, reject) => {
            this.db.close(
                (err) => {
                    if (err) {
                        reject(ErrorCode.RESULT_FAILED);
                    } else {

                        resolve(ErrorCode.RESULT_OK);
                    }
                });
        });
    }
}


