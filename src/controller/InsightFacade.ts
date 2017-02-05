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
            //let query_keys = Object.keys(query);

            let json= fs.readFileSync("./data/courses.dat").toString();
            let jonj=JSON.parse(json);
            let query_keys = Object.keys(query);
            if (query_keys.length < 2) {
                return reject({code: 400, body: {"error": "Invalid query"}});
            }
            else if (query_keys.indexOf("WHERE") < 0 || query_keys.indexOf("OPTIONS") < 0) {
                return reject({code: 400, body: {"error": "Invalid query"}});
            }

            let where:any = query.WHERE;





            let missing:string[] = [];
            let c_list:string[] = [];
            let ids:string[] = [];
            let response = validateOptions(query["OPTIONS"], missing, c_list, ids);
            //console.log(response);
            if(response!=true)
            {
                return reject(response);
            }
            else if(missing.length > 0)
            {
                return reject({code: 424, body: missing});
            }
            response = validateWhere(query["WHERE"], missing);
            //console.log(query["WHERE"]);
            if(response!=true)
            {
                return reject(response);
            }
            else if(missing.length > 0)
            {
                return reject({code: 424, body: missing});
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
            //console.log(retData);
            return resolve({code: 200, body: re});





        });
    }

}

function validateOptions(options:any, missing:string[], c_list:string[], ids:string[])
{

    let opt_keys = Object.keys(options);
    if(opt_keys.length != 3)
        return {code: 400, body: {"error": "Invalid query"}};
    else if(opt_keys.indexOf("COLUMNS")<0||opt_keys.indexOf("ORDER")<0||opt_keys.indexOf("FORM")<0)
        return {code: 400, body: {"error": "Invalid query"}};
    else
    {
        let columns = options["COLUMNS"];
        let order = options["ORDER"];
        for(let c of columns)
        {
            let slices = c.split("_");
            if(!fs.existsSync("./data/" + slices[0] + ".dat"))
            {
                if(missing.indexOf(slices[0])<0)
                    missing.push(slices[0]);
            }
            else
            {
                if(c_list.indexOf(c)<0)
                {
                    c_list.push(c);
                }
                if(ids.indexOf(slices[0])<0)
                {
                    ids.push(slices[0]);
                }
            }
        }
        if(!fs.existsSync("./data/"+order.split("_")[0]+".dat"))
        {
            if(missing.indexOf(order.split("_")[0])<0)
                missing.push(order.split("_")[0]);
        }
        return true;
    }
}

function validateWhere(where:any, missing:string[])
{
    let where_keys = Object.keys(where);
    for (let k in where_keys)
    {
        switch (where_keys[k]) {
            case 'AND':
                let h1_keys_and = Object.keys(where["AND"]);
                if (h1_keys_and.length < 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: AND should have at least one condition"}
                    };
                else {
                    for (let k in h1_keys_and) {
                        let s = where["AND"][k];
                        let s_keys = Object.keys(s);
                        for (let sk in s_keys) {
                            let h3 = s[s_keys[sk]];
                            if (s_keys[sk] == "AND" || s_keys[sk] == "OR") {
                                let h3_keys = Object.keys(h3);
                                for (let hk in h3_keys) {
                                    let temp_keys = Object.keys(h3[hk]);
                                    if (temp_keys.indexOf("AND") > -1 || temp_keys.indexOf("OR") > -1)
                                        return {
                                            code: 400,
                                            body: {"error": "OR should contain an array"}
                                        };
                                    else {
                                        for (let key in temp_keys) {
                                            let target: string;
                                            switch (key) {
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
                                            }
                                            if (target == null)
                                                return {code: 400, body: {"error": "Invalid query"}};
                                            let target_key = Object.keys(target);
                                            let string = target_key.toString();
                                            //console.log(string);
                                            if(!fs.existsSync("./data/"+
                                                    string.split("_")[0]+".dat"))
                                                missing.push(Object.keys(target)[0].split("_")[0]);
                                        }
                                    }

                                }
                            }
                            else {
                                let target: string;
                                switch (s_keys[sk]) {
                                    case 'LT':
                                        target = h3["LT"];
                                        break;
                                    case 'GT':
                                        target = h3["GT"];
                                        break;
                                    case 'EQ':
                                        target = h3["EQ"];
                                        break;
                                    case 'IS':
                                        target = h3["IS"];
                                        break;
                                    case 'NOT':
                                        target = h3["NOT"];
                                        break;
                                }
                                if (target == null)
                                    return {code: 400, body: {"error": "Invalid query"}};
                                let target_key = Object.keys(target);
                                let string = target_key.toString();
                                //console.log(string);
                                if(!fs.existsSync("./data/"+
                                        string.split("_")[0]+".dat"))
                                    missing.push(Object.keys(target)[0].split("_")[0]);
                            }
                        }
                    }
                }
                break;
            case 'OR':
                let h1_keys_or = Object.keys(where["OR"]);
                if (h1_keys_or.length < 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: OR should have at least one condition"}
                    };
                else {
                    for (let k in h1_keys_or) {
                        let s = where["OR"][k];
                        let s_keys = Object.keys(s);
                        for (let sk in s_keys) {
                            let h3 = s[s_keys[sk]];
                            if (s_keys[sk] == "AND" || s_keys[sk] == "OR") {
                                let h3_keys = Object.keys(h3);
                                for (let hk in h3_keys) {
                                    let temp_keys = Object.keys(h3[hk]);
                                    if (temp_keys.indexOf("AND") > -1 || temp_keys.indexOf("OR") > -1)
                                        return {
                                            code: 400,
                                            body: {"error": "OR should contain an array"}
                                        };
                                    else {
                                        for (let key in temp_keys) {
                                            let target: any;
                                            switch (temp_keys[key]) {
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
                                            }
                                            if (target == null)
                                                return {code: 400, body: {"error": "Invalid query"}};
                                            let target_key = Object.keys(target);
                                            let string = target_key.toString();
                                            //console.log(string);
                                            if(!fs.existsSync("./data/"+
                                                    string.split("_")[0]+".dat"))
                                                missing.push(Object.keys(target)[0].split("_")[0]);
                                        }
                                    }

                                }
                            }
                            else {
                                let target: string;
                                switch (s_keys[sk]) {
                                    case 'LT':
                                        target = h3["LT"];
                                        break;
                                    case 'GT':
                                        target = h3["GT"];
                                        break;
                                    case 'EQ':
                                        target = h3["EQ"];
                                        break;
                                    case 'IS':
                                        target = h3["IS"];
                                        break;
                                    case 'NOT':
                                        target = h3["NOT"];
                                        break;
                                }
                                if (target == null)
                                    return {code: 400, body: {"error": "Invalid query"}};
                                let target_key = Object.keys(target);
                                let string = target_key.toString();
                                //console.log(string);
                                if(!fs.existsSync("./data/"+
                                        string.split("_")[0]+".dat"))
                                    missing.push(Object.keys(target)[0].split("_")[0]);
                            }

                        }
                    }
                }
                break;
            case
            "LT":
                let h1_keys_lt = Object.keys(where["LT"]);
                if (h1_keys_lt.length != 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: LT should have one condition"}
                    };
                else
                {
                    let string = h1_keys_lt.toString();
                    //console.log(string);
                    if(!fs.existsSync("./data/"+
                            string.split("_")[0]+".dat"))
                        missing.push(string.split("_")[0]);
                }
                break;
            case
            "GT":
                let h1_keys_gt = Object.keys(where["GT"]);
                if (h1_keys_gt.length != 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: GT should have one condition"}
                    };
                else
                {
                    let string = h1_keys_gt.toString();
                    //console.log(string);
                    if(!fs.existsSync("./data/"+
                            string.split("_")[0]+".dat"))
                        missing.push(string.split("_")[0]);
                }
                break;
            case
            "EQ":
                let h1_keys_eq = Object.keys(where["EQ"]);
                if (h1_keys_eq.length != 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: EQ should have one condition"}
                    };
                else
                {
                    let string = h1_keys_eq.toString();
                    //console.log(string);
                    if(!fs.existsSync("./data/"+
                            string.split("_")[0]+".dat"))
                        missing.push(string.split("_")[0]);
                }
                break;
            case
            "IS":
                let h1_keys_is = Object.keys(where["GT"]);
                if (h1_keys_is.length != 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: IS should have one condition"}
                    };
                else
                {
                    let string = h1_keys_is.toString();
                    //console.log(string);
                    if(!fs.existsSync("./data/"+
                            string.split("_")[0]+".dat"))
                        missing.push(string.split("_")[0]);
                }
                break;
            case
            "NOT":
                let h1_keys_not = Object.keys(where["NOT"]);
                if (h1_keys_not.length != 1)
                    return {
                        code: 400,
                        body: {"error": "Invalid query: NOT should have one condition"}
                    };
                else
                {
                    let string = h1_keys_not.toString();
                    //console.log(string);
                    if(!fs.existsSync("./data/"+
                            string.split("_")[0]+".dat"))
                        missing.push(string.split("_")[0]);
                }
                break;
            default:
                return {code: 400, body: {"error": "Invalid query"}};
        }
    }
    return true;
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
