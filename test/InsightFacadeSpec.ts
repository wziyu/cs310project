/**
 * Created by yhyma on 1/23/2017.
 */
import {expect} from 'chai';

import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
let fs = require("fs");

describe("InsightFacadeSpec", function () {

    let facade: InsightFacade = null;
    beforeEach(function () {
        facade = new InsightFacade();
    });

    afterEach(function () {
        facade = null;
    });
    it("Testing addDataset with new id", function () {
        let data = fs.readFileSync("./courses.zip");
        return facade.addDataset("courses", data).then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
    it("Testing addDataset with existing id", function () {
        //let data = fs.readFileSync("./courses.zip");
        return facade.addDataset("courses", null).then(function (value: InsightResponse) {
            expect(value.code).to.equal(201)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
    it("Testing addDataset with null data", function () {
        let data = null;
        return facade.addDataset("invalid", data).then(function (value: InsightResponse) {
            //expect(value.code).to.equal(400)
            //console.log(value.code);
        }).catch(function (err: InsightResponse) {
            console.log(err.code);
        });
    });
    it("Testing addDataset with picture data", function () {
        let data = fs.readFileSync("./IMG_4436.jpg");
        return facade.addDataset("picture", data).then(function (value: InsightResponse) {
            //expect(value.code).to.equal(400)
            //console.log(value.code);
        }).catch(function (err: InsightResponse) {
            console.log(err.code);
        });
    });
    it("Testing addDataset with picture data", function () {
        let data = fs.readFileSync("./example.zip");
        return facade.addDataset("invalid_zip", data).then(function (value: InsightResponse) {
            //expect(value.code).to.equal(400)
            //console.log(value.code);
        }).catch(function (err: InsightResponse) {
            console.log(err.code);
        });
    });
    /*it("Testing removeDataset with existing id", function () {
        return facade.removeDataset("courses").then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
    it("Testing removeDataset with new id", function () {
        return facade.removeDataset("courses").then(function (value: InsightResponse) {
            //expect(value.code).to.equal(404)
            //console.log(value.code);
        }).catch(function (err:InsightResponse) {
            console.log(err.code)
        });
    });
    it("Testing removeDataset with another id", function () {
        return facade.removeDataset("invalid_id").then(function (value: InsightResponse) {
            //expect(value.code).to.equal(404)
            //console.log(value.code);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
        });
    });*/
    it("testing process Data function", function() {
        let content = '{"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"],"ORDER":"courses_avg","FORM":"TABLE"}}';//"https://github.com/ubccpsc/310/blob/2017jan/project/courses.zip"; //empty content, not valid
        let expected : any ="";
        // let q:QueryRequestImpl;
        // q.setBody();


        return new InsightFacade().performQuery({WHERE:{"GT":{"courses_avg":97}},OPTIONS:{"COLUMNS":["courses_dept","courses_avg"],"ORDER":"courses_avg","FORM":"TABLE"}})
            .then(function (result: any) { //what the paramter is goes here
                Log.info(result);

            })
            .catch(function (err:any) {
                expect.fail();

                // done()
            })
    });




});