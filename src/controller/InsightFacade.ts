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

        return new Promise<InsightResponse>(function (resolve, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true}).then(function (data: any) {
                let proList: Promise<string>[] = [];
                let keys = Object.keys(data);
                let objkeys = Object.keys(data[keys[0]]);
                let processed_results: any[] = [];
                for (let i = 1; i < objkeys.length; i++) {
                    let file = zip.file(objkeys[i]);
                    if (file) {
                        proList.push(file.async("string"));
                    }
                }
                Promise.all(proList).then(strings => {
                    for (let i = 1; i < objkeys.length; i++) {
                        if (strings[i - 1].charAt(0) == "\"")
                            return reject({code: 400, body: {'error': "Could not parse JSON"}});
                        let temp = JSON.parse(strings[i - 1]);
                        let temp_keys = Object.keys(temp);
                        if (temp_keys.indexOf('result') < 0 || temp['result'] === undefined)
                            return reject({code: 400, body: {'error': "Invalid data inside zip file"}});
                        let results = temp['result'];
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

                        for (let r of results) {

                            // let clean_str = '';
                            // let r_keys = Object.keys(r);
                            // for (let k of clean_input_keys) {
                            //     if (r_keys.indexOf(k) < 0) {
                            //         clean_input_keys.splice(clean_input_keys.indexOf(k), 1);
                            //         clean_output_keys.splice(clean_input_keys.indexOf(k), 1);
                            //     }
                            // }

                            var newo: any = {};
                            for (let i: number = 0; i < clean_input_keys.length; i++) {

                                newo[clean_output_keys[i]] = r[clean_input_keys[i]];
                            }
                            processed_results.push(newo);

                            //console.log((processed_results));

                            // for (let i: number = 0; i < clean_input_keys.length; i++) {
                            //     if (i < clean_input_keys.length - 1)
                            //         clean_str += (clean_output_keys[i] + ": " + r[clean_input_keys[i]] + ", ");
                            //     else
                            //         clean_str += (clean_output_keys[i] + ": " + r[clean_input_keys[i]] + " ");
                            // }
                            // let clean_to_push = "{" + clean_str + "}";
                            // processed_results.push(clean_to_push.toString());
                        }
                    }
                    if (processed_results.length === 0)
                        return reject({code: 400, body: {'error': "Nothing to write"}});
                    if (fs.existsSync("./data")) {
                        if (fs.existsSync("./data/" + id + ".dat")) {
                            //console.log(processed_results);
                            fs.writeFileSync("./data/" + id + ".dat", JSON.stringify(processed_results));
                            return resolve({code: 201, body: {}});
                        }
                        else {
                            let path: string = "./data/" + id + ".dat";
                            fs.writeFileSync(path, JSON.stringify(processed_results));
                            return resolve({code: 204, body: {}});
                        }
                    }
                    else {
                        fs.mkdirSync("./data");
                        let path: string = "./data/" + id + ".dat";
                        fs.writeFileSync(path, JSON.stringify(processed_results));
                        return resolve({code: 204, body: {}});
                    }
                }).catch(function (err) {
                    return reject({code: 400, body: {"error": err.toString()}});
                });

            }).catch(function (err: any) {
                return reject({code: 400, body: {"error": err.toString()}});
            });
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (resolve, reject) {
            let path: string = "./data/" + id + ".dat";
            if (!fs.existsSync("./data") || !fs.existsSync(path)) {
                reject({code: 404, body: {}});
            }
            else {
                fs.unlinkSync(path);
                resolve({code: 204, body: {}});
            }
        });

    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {

        return new Promise<InsightResponse>(function (resolve, reject) {
            //let query_json = JSON.parse(query.toString());
            let query_keys = Object.keys(query);

            let json= fs.readFileSync("./data/courses.dat").toString();
            let jonj=JSON.parse(json);

            let where:any = query.WHERE;
            if (where==null) {
                reject({code: 400, body: {}});
            }

            var q: any = Object.keys(where)[0];
            var w: any = where[q];

            var filtered_data: any = helper(q, w, jonj);
            let column: any = query.OPTIONS["COLUMNS"];
            let retData: any[] = [];

            for (let v of filtered_data) {
                let newEntry: any = {}
                column.forEach(function (k: any) {
                    return newEntry[k] = v.hasOwnProperty(k) ? v[k] : null;
                });
                retData.push(newEntry);
            }

            let order: any = query.OPTIONS["ORDER"];
            retData.sort(function (a: any, b: any) {
                return a[order] - b[order];
            });

            let re = {
                reder: 'TABLE',
                result: retData
            };
            ;
            console.log(retData);
            return resolve({code: 200, body: {re}});




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

            //
        });
    }

}

function intersect(a:any,b:any){

    if(a.length == 0) {
        return b;
    }

    var re = [];
    for(let a1 of a){
        var flag = 0;
        for(let b1 of b){
            if(b1.courses_id == a1.courses_id) {
                flag = 1;
                break;
            }
        }
        if(flag == 1)
            re.push(a1);
    }

    return re;
}
function union(a:any,b:any){
    if(a.length == 0) {
        return b;
    }

    var re = [];
    for(let a1 of a){
        var flag = 0;
        for(let b1 of b){
            if(b1.courses_id == a1.courses_id) {
                flag = 1;
                break;
            }
        }
        if(flag == 0)
            re.push(a1);
    }
    re = re.concat(b);
    return re;
}


function helper(key:string,filter:any,coursedata:any[]){
    switch (key) {
        case "AND":
            var results = []
            for (var k of filter){
                let keys = Object.keys(k);
                var a=keys[0];
                var b=k[a];
                var result = helper(a,b,coursedata);
                results.push(result);
            }
            var last:any = [];
            var first = 1;
            for (var r of results) {
                last = intersect(last, r);
            }
            return last;



        case "OR":
            var results = []
            for (var k of filter){
                let keys = Object.keys(k);
                var a=keys[0];
                var b=k[a];
                var result = helper(a,b,coursedata);
                results.push(result);
            }
            var last:any = [];
            for (var r of results) {
                last = union(last, r);
            }
            return last;
        case "NOT":
            var a = Object.keys(filter)[0];
            var b= filter[a];
            var result=helper(a,b,coursedata);
            var courses:any = coursedata.filter(elem => !result.includes(elem)) ;
            return courses;

        case "EQ":
            var query_keys = Object.keys(filter)[0];
            var query_number=filter[query_keys];
            var courses:any = [];
            for(let v of coursedata){
                if(v[query_keys] == query_number){
                    courses.push(v);
                }
            }
            return courses;
        case "GT":
            var query_keys = Object.keys(filter)[0];
            var query_number=filter[query_keys];
            var courses:any = [];//coursedata.filter(elem => (elem as any)[query_keys] > query_number);
            for(let v of coursedata){
                if(v[query_keys] > query_number){
                    courses.push(v);
                }
            }
            //console.log(courses);
            return courses;
        case "LT":
            var query_keys = Object.keys(filter)[0];
            var query_number=filter[query_keys];
            var courses:any = [];//coursedata.filter(elem => (elem as any)[query_keys] > query_number);
            for(let v of coursedata){
                if(v[query_keys] < query_number){
                    courses.push(v);
                }
            }
            //console.log(courses);
            return courses;
        case "IS":
            var query_keys = Object.keys(filter)[0];
            var query_number=filter[query_keys];
            var courses:any = [];
            for(let v of coursedata){
                if(v[query_keys] == query_number){
                    courses.push(v);
                }
            }
            return courses;
        default:throw new Error("not valid filter");
    }

}
