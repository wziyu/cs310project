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

        let zip = new JSZip();
        zip.loadAsync(content);
        console.log(zip);
        let p:Promise<InsightResponse> = null;
        return p;

    }

    removeDataset(id: string): Promise<InsightResponse> {
        return null;
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
            fs.readFile("./courses.zip", function(err:string, data: string){
            if (err) throw err;
            let t:Promise<InsightResponse> = this.addDataset(course, data);
            return t;

        })
            return null;
    }
}
