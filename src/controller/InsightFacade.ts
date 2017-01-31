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
                let processed_results:string[] = [];
                for(let i=1; i<objkeys.length; i++)
                {
                    proList.push(zip.file(objkeys[i]).async("string"));
                }
                Promise.all(proList).then(strings=>{
                    for(let i=1; i<objkeys.length; i++)
                    {
                        if(strings[i-1].charAt(0)=="\"")
                            return reject({code: 400, body: {'error': "Could not parse JSON"}});
                        let temp = JSON.parse(strings[i-1]);
                        let temp_keys = Object.keys(temp);
                        //console.log(temp_keys.indexOf('result'));
                        if(temp_keys.indexOf('result')<0||temp['result']===undefined)
                            return reject({code: 400, body: {'error': "Invalid data inside zip file"}});
                        let results = temp['result'];
                        //console.log(results);
                        for(let r of results)
                        {
                            let clean_input_keys =
                                [
                                    'Subject',
                                    'Course',
                                    'Avg',
                                    'Professor',
                                    'Title',
                                    'Pass',
                                    'Fail',
                                    'Audit',
                                    'id'
                                ];
                            let clean_output_keys =
                                [
                                    'courses_dept',
                                    'courses_id',
                                    'courses_avg',
                                    'courses_instructor',
                                    'courses_title',
                                    'courses_pass',
                                    'courses_fail',
                                    'courses_audit',
                                    'courses_uuid'
                                ];
                            let clean_str='';
                            let r_keys = Object.keys(r);
                            for(let k of clean_input_keys)
                            {
                                //console.log(r_keys.indexOf(k));
                                if(r_keys.indexOf(k)<0)
                                {
                                    clean_input_keys.splice(clean_input_keys.indexOf(k), 1);
                                    clean_output_keys.splice(clean_input_keys.indexOf(k), 1);
                                }
                            }
                            for(let i:number=0; i<clean_input_keys.length; i++)
                            {
                                if(i<clean_input_keys.length-1)
                                    clean_str+=(clean_output_keys[i]+": "+r[clean_input_keys[i]]+", ");
                                else
                                    clean_str+=(clean_output_keys[i]+": "+r[clean_input_keys[i]]+" ");
                            }
                            let clean_to_push = "{"+clean_str+"}";
                            //console.log(clean_to_push);
                            //let parsed = JSON.parse(clean_to_push);
                            processed_results.push(clean_to_push.toString());
                        }
                        //console.log(processed_results);
                    }
                    if(fs.existsSync("./data"))
                    {
                        let path:string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(processed_results));
                    }
                    else
                    {
                        fs.mkdirSync("./data");
                        let path:string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(processed_results));
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
