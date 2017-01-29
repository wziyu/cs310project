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
            zip.loadAsync(content).then(function (data: any) {
                //console.log(data);
                if(fs.existsSync("./data/"+id+".dat"))
                {
                    resolve({code: 201, body: {}});
                }
                else if(!fs.existsSync("./data"+id+".dat"))
                {
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
                                reject({code: 400, body: {'error': "Could not parse JSON"}});
                            let name: string = objkeys[i].split('/')[1];
                            let s: string = "\""+name+"\""+":"+strings[i-1];
                            s = "{" + s + "}";
                            let parsed = JSON.parse(s);
                            //console.log(s);
                            to_write_list.push(parsed);
                        }
                        if(!fs.existsSync("./data"))
                        {
                            fs.mkdirSync("./data");
                            let path:string = "./data/" + id + ".dat";
                            fs.writeFileSync(path, JSON.stringify(to_write_list));
                        }
                        else
                        {
                            let path:string = "./data/" + id + ".dat";
                            fs.writeFileSync(path, JSON.stringify(to_write_list));
                        }
                        resolve({code: 204, body: {}});
                    });
                }
                else
                    reject({code: 400, body: {'error': "Could not create file"}});


            }).catch(function (err: any) {
                console.log(err);
                reject({code: 400, body: {'error': err}});
            });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (resolve, reject) {
            let path:string = "./data/" + id + ".dat";
            if (!fs.existsSync("./data"))
            {
                console.log("in 1st if");
                reject({code: 404, body: {}});
            }
            else if (!fs.existsSync(path))
            {
                console.log("in 2nd else if");
                reject({code: 404, body: {}});
            }
            else
            {
                console.log("in else");
                fs.unlinkSync(path);
                resolve({code: 204, body: {}});
            }
        }).catch(function (err: any) {
            console.log(err);
        });

    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {

            return null;
    }
}
