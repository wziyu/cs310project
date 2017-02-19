import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";

import Log from "../Util"
import {isUndefined} from "util";
let JSZip = require("jszip");
let fs = require("fs");
const parse5 = require('parse5');
const rq = require('request');
export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (resolve, reject) {
            let zip = new JSZip();
            zip.loadAsync(content, {base64: true}).then(function (data: any) {
                if(id == "courses")
                {
                    //console.log(data);
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
                }
                else
                {
                    let proList: Promise<string>[] = [];
                    let keys = Object.keys(data);
                    let objkeys = Object.keys(data[keys[0]]);
                    let rooms: any = [];
                    let address:any = [];
                    let building_list:any[] = [];
                    zip.file("index.htm").async("string").then(function (data:any){
                        let parsed = parse5.parse(data);
                        index_tree_helper(parsed, building_list);
                        for (let i = 1; i < objkeys.length; i++)
                        {
                            let file = zip.file(objkeys[i]);
                            if(file && building_list.indexOf(objkeys[i].split("campus/discover/buildings-and-classrooms/")[1])>-1)
                            {
                                proList.push(file.async("string"));
                            }
                        }
                        Promise.all(proList).then(strings => {

                            for(let s of strings)
                            {
                                let tree = parse5.parse(s);
                                building_tree_helper(tree, rooms, address);
                            }
                            return resolve({code: 201, body: {}});
                        }).catch(function (err) {
                            return reject({code: 400, body: {"error": err.toString()}});
                        });
                    }).catch(function (err: any){
                        return reject({code: 400, body: {"error": err.toString()}});
                    });
                }

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
            let json:any;
            if(ids.length > 0)
            {
                if(fs.readFileSync("./data/"+ ids[0] + ".dat"))
                    json = fs.readFileSync("./data/"+ ids[0] + ".dat").toString();
            }
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

function index_tree_helper(node: any, list: any)
{
    //console.log("hi");
    let nodeKeys = Object.keys(node);
    if(nodeKeys.indexOf('attrs')>-1)
    {
        let attrs = node.attrs;
        for(let at of attrs)
        {
            if(at.name == 'class'&&at.value == 'views-field views-field-field-building-code')
            {
                list.push(node.childNodes[0].value.split('\n')[1].replace(/ /g,''));
            }
        }
    }
    if(nodeKeys.indexOf('childNodes')>-1)
    {
        let children = node.childNodes;
        for(let child of children)
        {
            index_tree_helper(child,list);
        }
    }
    //return true;
}

function building_tree_helper(node: any, rooms:any, address_list:any)
{
    let key_list = [
        "views-field views-field-field-room-number",
        "views-field views-field-field-room-capacity",
        "views-field views-field-field-room-furniture",
        "views-field views-field-field-room-type",
    ];
    let nodeKeys = Object.keys(node);
    if(nodeKeys.indexOf('attrs')>-1)
    {
        let attrs = node.attrs;
        for(let at of attrs)
        {
            let room:string;
            let shortname:string;
            let fullname:string;
            let address:string;
            let href:string;
            let number:string;
            let room_name:string;
            let seats:number;
            let type:string;
            let furniture:string;
            if(at.name === "id" && at.value === "building-info")
            {
                let kids = node.childNodes;
                let values = [];
                for(let kid of kids)
                {
                    if(typeof kid.attrs !== 'undefined' && kid.attrs.length === 0)
                    {
                        if(typeof kid.childNodes !== 'undefined')
                        {
                            for (let a of kid.childNodes[0].attrs)
                            {
                                if (a.name === 'class' && a.value === 'field-content')
                                {
                                    let target_node = kid.childNodes[0].childNodes[0];
                                    if(typeof target_node !== 'undefined' && typeof target_node.value !== 'undefined')
                                        values.push(target_node.value);
                                }
                            }
                        }
                    }
                    else
                    {
                        if(typeof kid.childNodes !== 'undefined')
                        {
                            for (let a of kid.attrs)
                            {
                                if (a.name === 'class' && a.value === 'building-field')
                                {
                                    for (let a of kid.childNodes[0].attrs)
                                    {
                                        if (a.name === 'class' && a.value === 'field-content')
                                        {
                                            let target_node = kid.childNodes[0].childNodes[0];
                                            if(typeof target_node !== 'undefined' && typeof target_node.value !== 'undefined')
                                                values.push(target_node.value);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                fullname = values[0];
                address = values[1];
                address_list.push(address);
            }
            else if(at.name === "class")
            {

                switch (at.value)
                {
                    case key_list[0]:
                        if(typeof node.childNodes !== 'undefined')
                        {
                            for(let kid of node.childNodes)
                            {
                                if(typeof kid.childNodes !== 'undefined' && kid.attrs.length != 0)
                                {
                                    for(let att of kid.attrs)
                                    {
                                        if(att.name == "href")
                                            href = att.value;
                                    }
                                    room_name = href.split("/room/")[1];
                                    number = room_name.split("-")[1];
                                    shortname = room_name.split("-")[0];
                                }
                            }
                        }
                        break;
                    case key_list[1]:
                        if(typeof node.childNodes !== 'undefined')
                        {
                            if(node.childNodes[0].value.replace( /^\D+/g, '') !== '')
                            {
                                seats = node.childNodes[0].value.replace(/^\D+/g, '');
                            }
                        }
                        break;
                    case key_list[2]:
                        if(typeof node.childNodes !== 'undefined')
                        {
                            if(node.childNodes[0].value.replace(/\r?\n|\r/g, '').trim() != 'Furniture type')
                            {
                                furniture = node.childNodes[0].value.replace(/\r?\n|\r/g, '').trim();
                            }
                        }
                        break;
                    case key_list[3]:
                        if(typeof node.childNodes !== 'undefined')
                        {
                            if(node.childNodes[0].value.replace(/\r?\n|\r/g, '').trim() != 'Room type')
                            {
                                type = node.childNodes[0].value.replace(/\r?\n|\r/g, '').trim();
                                //console.log(type);
                            }
                        }
                        break;
                }
            }
            room = 
        }
    }
    if(nodeKeys.indexOf('childNodes')>-1)
    {
        let children = node.childNodes;
        for(let child of children)
        {
            building_tree_helper(child,rooms,address_list);
        }
    }
    //return true;
}

function intersect(a:any,b:any) {
    if (a.length == 0) {
        return a;
    }
    var re = [];
    var actualTags = a.map(function (obj: any) {
        return obj.courses_uuid;
    });

    for (var bb of b) {

        if (actualTags.indexOf(bb.courses_uuid) != -1) {
            re.push(bb);

        }

    }
    return re;
}




function union(a: any, b: any) {
    if (a.length == 0) {
        return b;
    }
    var re = [];
    var actualTags = a.map(function (obj: any) {
        return obj.courses_uuid;
    });

    var b_after = b.filter(function(bb:any) {
        return actualTags.indexOf(bb.courses_uuid) == -1 // if truthy then keep item
    })
    re = b_after.concat(a);
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

            let i:number=0;

            if(results.length>1){
                last=results[0];
            }


            for (var r of results) {
                //console.log("------------"+i+"--------------");
                if (results.indexOf(r)==0){
                    continue;
                }
                last = intersect(last, r);
                // console.log(last);
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
                        if (v[query_keys].toString().includes(query_number.substring(1, query_number.length - 1))) {
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
    let clean_output_keys =
        [
            'dept',
            'id',
            'avg',
            'instructor',
            'title',
            'pass',
            'fail',
            'audit',
            'uuid'
        ];
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
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number" || clean_output_keys.indexOf(key_string.split("_")[1])<0)
                    return {
                        code: 400,
                        body: {"error": "Invalid GT"}
                    };

                break;
            case 'LT':
                key_string = Object.keys(target[where_keys[k]]).toString();
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number" || clean_output_keys.indexOf(key_string.split("_")[1])<0)
                    return {
                        code: 400,
                        body: {"error": "Invalid LT"}
                    };
                break;
            case 'EQ':
                key_string = Object.keys(target[where_keys[k]]).toString();
                console.log(clean_output_keys.indexOf(key_string.split("_")[1]));
                if (key_string!= "" && !fs.existsSync("./data/" + key_string.split("_")[0] + ".dat"))
                {
                    if(missing.indexOf(key_string.split("_")[0])<0)
                        missing.push(key_string.split("_")[0]);
                    if(missing.length>0)
                        return true;
                }
                if(typeof(target[where_keys[k]][key_string])!="number" || clean_output_keys.indexOf(key_string.split("_")[1])<0)
                    return {
                        code: 400,
                        body: {"error": "Invalid EQ"}
                    };
                break;
            case 'IS':
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
                else if(typeof(target[where_keys[k]][key_string])!="string" || clean_output_keys.indexOf(key_string.split("_")[1])<0)
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