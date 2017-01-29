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
        let data = fs.readFileSync("./data/courses.zip");
        return facade.addDataset("courses", data).then(function (value: InsightResponse) {
            expect(value.code).to.equal(201)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
    it("Testing removeDataset with existing id", function () {
        return facade.removeDataset("courses").then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
});