/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util"
let JSZip = require("jszip");
let fs = require("fs");

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {

        return new Promise<InsightResponse>(function(resolve, reject) {
            let zip = new JSZip();         
            zip.loadAsync(content, {base64: true}).then(function (data: any) {
                if(fs.existsSync("./data/"+id+".dat"))
                {
                    return resolve({code: 201, body: {}});
                }
                let proList: Promise<string>[] = [];
                let keys = Object.keys(data);
                let objkeys = Object.keys(data[keys[0]]);
                let to_write_list: string[] = [];
                for(let i=1; i<objkeys.length; i++)
                {
                    proList.push(zip.file(objkeys[i]).async("string"));
                }
                Promise.all(proList).then(strings=>{
                    for(let i=1; i<objkeys.length; i++)
                    {
                        if(strings[i-1].charAt(0)=="\"")
                            return reject({code: 400, body: {'error': "Could not parse JSON"}});
                        let name: string = objkeys[i].split('/')[1];
                        let temp = JSON.parse(strings[i-1]);
                        let temp_keys = Object.keys(temp);
                        //console.log(temp_keys.indexOf('result'));
                        if(temp_keys.indexOf('result')<0||temp['result']===undefined)
                            return reject({code: 400, body: {'error': "Invalid data inside zip file"}});
                        let s: string = "\""+name+"\""+":"+strings[i-1];
                        s = "{" + s + "}";
                        let parsed = JSON.parse(s);

                        to_write_list.push(parsed);
                    }
                    if(fs.existsSync("./data"))
                    {
                        let path:string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(to_write_list));
                    }
                    else
                    {
                        fs.mkdirSync("./data");
                        let path:string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(to_write_list));
                    }
                    return resolve({code: 204, body: {}});
                }).catch(function (err){
                    return reject({code: 400, body: {"error": err.toString()}});
                });

            }).catch(function (err: any) {
                return reject({code: 400, body: {"error": err.toString()}});
            });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (resolve, reject) {
            let path:string = "./data/" + id + ".dat";
            if (!fs.existsSync("./data")||!fs.existsSync(path))
            {
                reject({code: 404, body: {}});
            }
            else
            {
                fs.unlinkSync(path);
                resolve({code: 204, body: {}});
            }
        });

    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {

            return null;
    }
}
