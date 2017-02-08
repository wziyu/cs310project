
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util"
import {isUndefined} from "util";
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
                let processed_results: any = [];
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
                            let newo: any = {};
                            for (let i: number = 0; i < clean_input_keys.length; i++) {
                                newo[clean_output_keys[i]] = r[clean_input_keys[i]];
                            }
                            processed_results.push(newo);
                        }

                    }
                    if (processed_results.length === 0)
                        return reject({code: 400, body: {'error': "Nothing to write"}});
                    if (fs.existsSync("./data")) {
                        if (fs.existsSync("./data/" + id + ".dat")) {
                            console.log("rewriting...");
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
            //validate query
            if (query_keys.length < 2) {
                return reject({code: 400, body: {"error": "Invalid query: missing where or options 1"}});
            }
            else if (query_keys.indexOf("WHERE") < 0 || query_keys.indexOf("OPTIONS") < 0) {
                return reject({code: 400, body: {"error": "Invalid query: missing where or options 2"}});
            }
            //console.log(query["OPTIONS"]);
            let missing: string[] = [];
            let c_list: string[] = [];
            let ids: string[] = [];
            let response = validateOptions(JSON.parse(JSON.stringify(query))["OPTIONS"], missing, c_list, ids);
            //console.log(response);
            if (response != true) {
                return reject(response);
            }
            else if (missing.length > 0) {
                return reject({code: 424, body: missing});
            }
            else {
                response = validateWhere(JSON.parse(JSON.stringify(query))["WHERE"], missing, c_list);
                //console.log(response);
                if (missing.length > 0) {
                    return reject({code: 424, body: missing});
                }
                else if (response != true) {
                    return reject(response);
                }


            }


//dui
            let where: any = JSON.parse(JSON.stringify(query))["WHERE"];
            var keys: any = Object.keys(where)[0];
            var filter: any = where[keys];
            let json = fs.readFileSync("./data/courses.dat").toString();
            let jonj = JSON.parse(json);

            var filtered_data: any = helper(keys, filter, jonj);
            let column: any = JSON.parse(JSON.stringify(query))["OPTIONS"]["COLUMNS"];
            let retData: any[] = [];

            for (let v of filtered_data) {
                let newEntry: any = {}
                column.forEach(function (k: any) {
                    return newEntry[k] = v.hasOwnProperty(k) ? v[k] : null;
                });
                retData.push(newEntry);
            }
            if (!isUndefined(JSON.parse(JSON.stringify(query))["OPTIONS"]["ORDER"])) {
                let order: any = JSON.parse(JSON.stringify(query))["OPTIONS"]["ORDER"];
                retData.sort(function (a: any, b: any) {
                    return a[order] - b[order];
                });
            }

            let re = {
                render: 'TABLE',
                result: retData
            };

            return resolve({code: 200, body: re});
        });
    }
}

function intersect(a: any, b: any) {

    if (a.length == 0) {
        return b;
    }

    var re = [];
    for (let a1 of a) {
        var flag = 0;
        for (let b1 of b) {
            if (b1.courses_uuid == a1.courses_uuid) {
                flag = 1;
                break;
            }
        }
        if (flag == 1)
            re.push(a1);
    }

    return re;
}
function union(a: any, b: any) {
    if (a.length == 0) {
        return b;
    }

    var re = [];
    for (let a1 of a) {
        var flag = 0;
        for (let b1 of b) {
            if (b1.courses_uuid == a1.courses_uuid) {
                flag = 1;
                break;
            }
        }
        if (flag == 0)
            re.push(a1);
    }
    re = re.concat(b);
    return re;
}


function helper(key: string, filter: any, coursedata: any[]) {
    switch (key) {
        case "AND":
            var results = []
            for (var k of filter) {
                let keys = Object.keys(k);
                var a = keys[0];
                var b = k[a];
                var result = helper(a, b, coursedata);
                results.push(result);
            }
            var last: any = [];

            for (var r of results) {
                last = intersect(last, r);
            }
            return last;


        case "OR":
            var results = [];
            for (var k of filter) {
                let keys = Object.keys(k);
                var a = keys[0];
                var b = k[a];
                var result = helper(a, b, coursedata);
                results.push(result);
            }
            var last: any = [];
            for (var r of results) {
                last = union(last, r);
            }
            return last;
        case "NOT":
            var a = Object.keys(filter)[0];
            var b = filter[a];
            var result = helper(a, b, coursedata);

            var courses: any = [];
            var numbers: any = [];

            for (let n of result) {
                numbers.push(n['courses_uuid'])
            }
            for(let v of coursedata){
                if(numbers.indexOf(v['courses_uuid']) == -1){
                    courses.push(v);
                }
            }

            //var courses: any = coursedata.filter(elem => !result.includes(elem));
            return courses;

        case "EQ":
            var query_keys = Object.keys(filter)[0];
            var query_number = filter[query_keys];
            var courses: any = [];
            for (let v of coursedata) {
                if (v[query_keys] == query_number) {
                    courses.push(v);
                }
            }
            return courses;
        case "GT":
            var query_keys = Object.keys(filter)[0];
            var query_number = filter[query_keys];
            var courses: any = [];//coursedata.filter(elem => (elem as any)[query_keys] > query_number);
            for (let v of coursedata) {
                if (v[query_keys] > query_number) {
                    courses.push(v);
                }
            }
            //console.log(courses);
            return courses;
        case "LT":
            var query_keys = Object.keys(filter)[0];
            var query_number = filter[query_keys];
            var courses: any = [];//coursedata.filter(elem => (elem as any)[query_keys] > query_number);
            for (let v of coursedata) {
                if (v[query_keys] < query_number) {
                    courses.push(v);
                }
            }
            //console.log(courses);
            return courses;
        case "IS":
            var query_keys = Object.keys(filter)[0];
            var query_number = filter[query_keys];
            var courses: any = [];
            for (let v of coursedata) {
                if (query_number.indexOf("*") == 0 && query_number.length > 1) {
                    if (query_number.indexOf("*", 1) == query_number.length - 1) {
                        if (v[query_keys].toString().endsWith(query_number.substring(1, query_number.length - 1))) {
                            courses.push(v);
                        }
                    } else {
                        if (v[query_keys].toString().endsWith(query_number.substring(1))) {
                            courses.push(v);
                        }
                    }
                } else if (query_number.indexOf("*") == query_number.length - 1 && query_number.length > 1) {
                    if (v[query_keys].toString().startsWith(query_number.substring(0, query_number.length - 1))) {
                        courses.push(v);
                    }
                }
                else {
                    if (v[query_keys].toString() == query_number) {
                        courses.push(v);
                    }
                }
            }
            return courses;
        default:
            throw new Error("not valid filter");
    }

}
function validateOptions(options: any, missing: string[], c_list: string[], ids: string[]) {
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
    let opt_keys = Object.keys(options);
    if (opt_keys.length < 2)
        return {code: 400, body: {"error": "Invalid query by options length"}};
    else if (opt_keys.indexOf("COLUMNS") < 0 || opt_keys.indexOf("FORM") < 0)
        return {code: 400, body: {"error": "Invalid query by option type"}};
    else {
        let columns = options["COLUMNS"];
        let order = options["ORDER"];
        let form = options["FORM"];
        if (form == null || form != "TABLE")
            return {code: 400, body: {"error": "Invalid query: FORM"}};
        for (let c of columns) {
            //console.log(c);
            let slices = c.split("_");
            if (!fs.existsSync("./data/" + slices[0] + ".dat")) {
                if (missing.indexOf(slices[0]) < 0)
                    missing.push(slices[0]);
            }
            else {
                if (c_list.indexOf(c) < 0) {
                    c_list.push(c);
                }
                if (ids.indexOf(slices[0]) < 0) {
                    ids.push(slices[0]);
                }
            }
        }
        //console.log(c_list);
        if (order != null) {
            if (clean_output_keys.indexOf(order) < 0 || c_list.indexOf(order) < 0) {
                return {code: 400, body: {"error": "Invalid query: ORDER"}};
            }
            else if (!fs.existsSync("./data/" + order.split("_")[0] + ".dat")) {
                if (missing.indexOf(order.split("_")[0]) < 0)
                    missing.push(order.split("_")[0]);
            }
        }

        if (c_list.length <= 0)
            return {code: 400, body: {"error": "Invalid query: COLUMNS"}};

        return true;
    }
}
function validateWhere(target: any, missing: string[], c_list: string[]): any {
    let where_keys = Object.keys(target);
    let return_list = [];
    for (let k in where_keys)
    {
        let key_string:string;
        switch (where_keys[k])
        {
            case 'AND':
                if(target[where_keys[k]].length<1)
                    return {code:400, body:{"error": "AND should have at least one filter"}};
                for(let t of target[where_keys[k]])
                {
                    let local_res = validateWhere(t, missing, c_list);
                    if(local_res != true)
                        return_list.push(local_res);
                }
                break;
            case 'OR':
                if(target[where_keys[k]].length<1)
                    return {code:400, body:{"error": "OR should have at least one filter"}};
                for(let t of target[where_keys[k]])
                {
                    let local_res = validateWhere(t, missing, c_list);
                    if(local_res != true)
                        return_list.push(local_res);
                }
                break;
            case 'GT':
                //console.log(target[where_keys[k]]);
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number")
                    return {
                        code: 400,
                        body: {"error": "Invalid GT"}
                    };

                break;
            case 'LT':
                //console.log(target[where_keys[k]]);
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number")
                    return {
                        code: 400,
                        body: {"error": "Invalid LT"}
                    };
                break;
            case 'EQ':
                //console.log(target[where_keys[k]]);
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number")
                    return {
                        code: 400,
                        body: {"error": "Invalid EQ"}
                    };
                break;
            case 'IS':
                //console.log(target[where_keys[k]]);
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if (c_list.indexOf(key_string) < 0)
                    return {
                        code: 400,
                        body: {"error": "Invalid IS"}
                    };
                else if(typeof(target[where_keys[k]][key_string])!="string")
                    return {
                        code: 400,
                        body: {"error": "Invalid IS"}
                    };
                break;
            case 'NOT':
                //console.log(target[where_keys[k]]);
                if(Object.keys(target[where_keys[k]]).length!=1)
                    return {code:400, body:{"error": "NOT should have only one filter"}};
                let local_res = validateWhere(target[where_keys[k]], missing, c_list);
                if(local_res != true)
                    return local_res;
                break;
            default:
                //console.log(where_keys[k]);
                return {code:400, body:{"error": "Invalid query"}};

        }
    }
    if(return_list.length<1)
        return true;
    else
        return return_list[0];
}
