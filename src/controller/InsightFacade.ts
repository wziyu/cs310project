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
                let proList: Promise<string>[] = [];
                let keys = Object.keys(data);
                let objkeys = Object.keys(data[keys[0]]);
                let processed_results:string[] = [];
                for(let i=1; i<objkeys.length; i++)
                {
                    let file = zip.file(objkeys[i]);
                    if (file)
                    {
                        proList.push(file.async("string"));
                    }
                }
                Promise.all(proList).then(strings=>{
                    for(let i=1; i<objkeys.length; i++)
                    {
                        if(strings[i-1].charAt(0)=="\"")
                            return reject({code: 400, body: {'error': "Could not parse JSON"}});
                        let temp = JSON.parse(strings[i-1]);
                        let temp_keys = Object.keys(temp);
                        if(temp_keys.indexOf('result')<0||temp['result']===undefined)
                            return reject({code: 400, body: {'error': "Invalid data inside zip file"}});
                        let results = temp['result'];
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
                            processed_results.push(clean_to_push.toString());
                        }
                    }
                    if(processed_results.length === 0)
                        return reject({code: 400, body: {'error': "Nothing to write"}});
                    if(fs.existsSync("./data"))
                    {
                        if(fs.existsSync("./data/"+id+".dat"))
                        {
                            console.log("rewriting...");
                            fs.writeFileSync("./data/"+id+".dat", JSON.stringify(processed_results));
                            return resolve({code: 201, body: {}});
                        }
                        else
                        {
                            let path:string = "./data/" + id + ".dat";
                            fs.writeFileSync(path, JSON.stringify(processed_results));
                            return resolve({code: 204, body: {}});
                        }
                    }
                    else
                    {
                        fs.mkdirSync("./data");
                        let path:string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(processed_results));
                        return resolve({code: 204, body: {}});
                    }
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

        return new Promise<InsightResponse>(function (resolve, reject) {
            //let query_json = JSON.parse(query.toString());
            let query_keys = Object.keys(query);
            //validate query
            if (query_keys.length < 2) {
                return reject({code: 400, body: {"error": "Invalid query"}})
            }
            else if (query_keys.indexOf("WHERE") < 0 || query_keys.indexOf("OPTIONS") < 0) {
                return reject({code: 400, body: {"error": "Invalid query"}})
            }
            let where: any = query['WHERE'];
            let where_keys = Object.keys(where);
            //console.log(where_keys[0]);
            for (let k in where_keys)
            {
                //console.log("in for loop " + where_keys[k]);
                switch (where_keys[k])
                {
                    case 'AND':
                        let h1_keys_and = Object.keys(where["AND"]);
                        if (h1_keys_and.length < 1)
                            return reject({
                                code: 400,
                                body: {"error": "Invalid query: AND should have at least one condition"}
                            });
                        else
                        {
                            for (let k in h1_keys_and)
                            {
                                let s = where["AND"][k];
                                let s_keys = Object.keys(s);
                                for (let sk in s_keys)
                                {
                                    let h3 = s[s_keys[sk]];
                                    if (s_keys[sk] == "AND" || s_keys[sk] == "OR")
                                    {
                                        let h3_keys = Object.keys(h3);
                                        for (let hk in h3_keys)
                                        {
                                            let temp_keys = Object.keys(h3[hk]);
                                            if (temp_keys.indexOf("AND") > -1 || temp_keys.indexOf("OR") > -1)
                                                return reject({
                                                    code: 400,
                                                    body: {"error": "OR should contain an array"}
                                                });
                                            else
                                            {
                                                for (let key in temp_keys)
                                                {
                                                    let target: string;
                                                    switch (key)
                                                    {
                                                        case 'LT':
                                                            target = h3[hk]["LT"];
                                                            break;
                                                        case 'GT':
                                                            target = h3[hk]["GT"];
                                                            break;
                                                        case 'EQ':
                                                            target = h3[hk]["EQ"];
                                                            break;
                                                        case 'IS':
                                                            target = h3[hk]["IS"];
                                                            break;
                                                        case 'NOT':
                                                            target = h3[hk]["NOT"];
                                                            break;
                                                        //default:
                                                            //return reject({code: 400, body: {"error": "Invalid query"}});
                                                    }
                                                }
                                            }

                                        }
                                    }
                                    else
                                    {
                                        switch (s_keys[sk])
                                        {
                                            case "LT":
                                                break;
                                            case "GT":
                                                break;
                                            case "EQ":
                                                break;
                                            case "IS":
                                                break;
                                            case "NOT":
                                                break;
                                            //default:
                                                //return reject({code: 400, body: {"error": "Invalid query"}});
                                        }
                                    }
                                }
                            }
                        }
                            break;
                        case 'OR':
                            let h1_keys_or = Object.keys(where["OR"]);
                            if (h1_keys_or.length < 1)
                                return reject({
                                    code: 400,
                                    body: {"error": "Invalid query: OR should have at least one condition"}
                                });
                            else
                            {
                                for (let k in h1_keys_or)
                                {
                                    let s = where["OR"][k];
                                    let s_keys = Object.keys(s);
                                    for (let sk in s_keys)
                                    {
                                        let h3 = s[s_keys[sk]];
                                        if (s_keys[sk] == "AND" || s_keys[sk] == "OR")
                                        {
                                            let h3_keys = Object.keys(h3);
                                            for (let hk in h3_keys)
                                            {
                                                let temp_keys = Object.keys(h3[hk]);
                                                if (temp_keys.indexOf("AND") > -1 || temp_keys.indexOf("OR") > -1)
                                                    return reject({
                                                        code: 400,
                                                        body: {"error": "OR should contain an array"}
                                                    });
                                                else
                                                {
                                                    for (let key in temp_keys)
                                                    {
                                                        let target: string;
                                                        console.log(temp_keys[key]);
                                                        //console.log(h3);
                                                        switch (temp_keys[key])
                                                        {
                                                            case 'LT':
                                                                target = h3[hk]["LT"];
                                                                break;
                                                            case 'GT':
                                                                target = h3[hk]["GT"];
                                                                break;
                                                            case 'EQ':
                                                                target = h3[hk]["EQ"];
                                                                break;
                                                            case 'IS':
                                                                target = h3[hk]["IS"];
                                                                break;
                                                            case 'NOT':
                                                                target = h3[hk]["NOT"];
                                                                break;
                                                            //default:
                                                                //return reject({code: 400, body: {"error": "Invalid query"}});
                                                        }
                                                    }
                                                }

                                            }
                                        }
                                        else {
                                            switch (s_keys[sk]) {
                                                case "LT":
                                                    break;
                                                case "GT":
                                                    break;
                                                case "EQ":
                                                    break;
                                                case "IS":
                                                    break;
                                                case "NOT":
                                                    break;
                                                //default:
                                                    //return reject({code: 400, body: {"error": "Invalid query"}});
                                            }
                                        }
                                    }
                                }

                            }
                            break;
                        case
                            "LT":
                            break;
                        case
                            "GT":
                            break;
                        case
                            "EQ":
                            break;
                        case
                            "IS":
                            break;
                        case
                            "NOT":
                            break;
                        default:
                            return reject({code: 400, body: {"error": "Invalid query"}});
                        }
                }
                let options: any = query['OPTIONS'];
                let opt_keys = Object.keys(options);
                if(opt_keys.length != 3)
                    return reject({code: 400, body: {"error": "Invalid query"}});
                else if(opt_keys.indexOf("COLUMNS")<0||opt_keys.indexOf("ORDER")<0||opt_keys.indexOf("FORM")<0)
                    return reject({code: 400, body: {"error": "Invalid query"}});
                else
                {
                    let columns = options["COLUMNS"];
                    let order = options["ORDER"];
                    let missing:string[] = [];
                    let c_list:string[] = [];
                    for(let c of columns)
                    {
                        let slices = c.split("_");
                        if(!fs.existsSync("./data/" + slices[0] + ".dat"))
                            missing.push(slices[0]);
                        else
                            c_list.push(c);
                    }
                    if(!fs.existsSync("./data/"+order.split("_")[0]+".dat"))
                        missing.push(order.split("_")[0]);
                    if(missing.length>0)
                        return reject({code:424, body:{"missing": missing}})
                }
                return resolve({code: 200, body: {}});
            });

    }
}


