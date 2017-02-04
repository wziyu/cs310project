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

            /*return new Promise<InsightResponse>(function (resolve, reject) {
                //let query_json = JSON.parse(query.toString());
                let query_keys = Object.keys(query);
                console.log(query_keys);
                resolve({code: 200, body: {}});
            });*/
        return new Promise<InsightResponse>(function (resolve, reject) {
            //let query_json = JSON.parse(query.toString());
            let query_keys = Object.keys(query);

            let json= fs.readFileSync("./courses.dat").toString();
            let jonj=JSON.parse(json);

            console.log(jonj);

            let where:any = query.WHERE;
            let q:any = Object.keys(where)[0];
            let w:any= where[q];

            let filtered_data:any = helper(q,w,jonj);



            let column:any = query.OPTIONS["COLUMNS"];
            let retData: any[] = [];

            for (let v of filtered_data) {
                let newEntry: any = {};
                column.forEach(function (k:any) {
                    return newEntry[k] = v.hasOwnProperty(k) ? v[k] : null;
                });
                retData.push(newEntry);
            }

            let order:any = query.OPTIONS["ORDER"];
            retData.sort(function(a:any,b:any){
                return a[order]-b[order];
            });

            return resolve({code: 200, body: {
                render: 'TABLE',
                result: retData
            }
            });
            //return re;

            // if()
            // {
            //     reject({code: 404, body: {}});
            // }
            // else if()
            // {
            //     reject({code: 400, body: {}});
            //
            // }
            // console.log(query_keys);
            // else
            // {
            //     resolve({code: 200, body: {}});
            //
        });
    }

}

function intersect(a:any,b:any){
    let t;
    if (b.length>a.length)
    {
        t=b;
        b=a;
        a=t;
    }
    return a.filter(function (e:any){
        if (b.indexOf(e)!==-1) return true;
    });
}
function union(a:any,b:any){
    let t;
    if (b.length>a.length)
    {
        t=b;
        b=a;
        a=t;
    }
    return a.filter(function (e:any){
        if (b.indexOf(e)===-1) return true;
    });
}


function helper(key:string,filter:any,coursedata:any[]){
    let results = [];
    let last:any = [];
    let first = 1;
    let courses:any;
    let query_keys:any;
    let query_number:any;
    switch (key) {
        //let results = [];
        case "AND":
            //let results = [];
            for (let k of filter){
                let keys = Object.keys(k);
                let a=keys[0];
                let b=k[a];
                let result = helper(a,b,coursedata);
                results.push(result);
            }
            last = [];
            first = 1;
            for (let r of results) {
                if (first === 1) {
                    last = r;
                    first = 0;
                }else {
                    last = intersect(r, last);
                }
            }

            return last;



        case "OR":
            //let results = [];
            for (let k of filter){
                let keys = Object.keys(k);
                let a=keys[0];
                let b=k[a];
                let result = helper(a,b,coursedata);
                results.push(result);
            }
            last = [];
            first = 1;
            for (let r of results) {
                if (first === 1) {
                    last = r;
                    first = 0;
                }else {
                    last = last.concat(union(r, last));
                }
            }

            return last;
        case "NOT":
            let a = Object.keys(filter)[0];
            let b= filter[a];
            let result=helper(a,b,coursedata);
            courses = coursedata.filter(elem => !result.includes(elem)) ;
            return courses;

        case "EQ":
            query_keys = Object.keys(filter)[0];
            query_number=filter[query_keys];
            courses = coursedata.filter(elem => (elem as any)[query_keys] = query_number);
            return courses;
        case "GT":
            query_keys = Object.keys(filter)[0];
            query_number=filter[query_keys];
            courses = coursedata.filter(elem => (elem as any)[query_keys] > query_number);
            return courses;
        case "LT":
            query_keys = Object.keys(filter)[0];
            query_number=filter[query_keys];
            courses = coursedata.filter(elem => (elem as any)[query_keys] < query_number);
            return courses;
        case "IS":
            query_keys = Object.keys(filter)[0];
            query_number=filter[query_keys];
            courses = coursedata.filter(elem => (elem as any)[query_keys] = query_number);
            return courses;
        default:throw new Error("not valid filter");
    }

}

