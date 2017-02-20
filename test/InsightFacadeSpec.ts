/**
 * Created by yhyma on 1/23/2017.
 */
import {expect} from 'chai';
import Server from "../src/rest/Server";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
let fs = require("fs");

describe("InsightFacadeSpec", function () {

    let facade: InsightFacade = null;
    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    beforeEach(function () {
        facade = new InsightFacade();
    });

    afterEach(function () {
        facade = null;
    });
    it("Should be able to echo", function () {


        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});


    });



    it("Testing addDataset with new ROOMS id", function () {
        let data = fs.readFileSync("./rooms.zip");
        return facade.addDataset("rooms", data).then(function (value: InsightResponse) {

             expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    // it("Testing addDataset with new COURSES id", function () {
    //     let data = fs.readFileSync("./courses.zip");
    //     return facade.addDataset("courses", data).then(function (value: InsightResponse) {
    //
    //         expect(value.code).to.equal(204)
    //     }).catch(function (err) {
    //         Log.test('Error: ' + err);
    //         expect.fail();
    //     });
    // });

    // // it("Testing addDataset with existing id", function () {
    // //     let data = fs.readFileSync("./courses.zip");
    // //     return facade.addDataset("courses", data).then(function (value: InsightResponse) {
    // //         expect(value.code).to.equal(201)
    // //     }).catch(function (err) {
    // //         Log.test('Error: ' + err);
    // //         expect.fail();
    // //     });
    // // });
    // // it("Testing addDataset with null data", function () {
    // //  let data = null;
    // //  return facade.addDataset("invalid", data).then(function (value: InsightResponse) {
    // //  //expect(value.code).to.equal(400)
    // //  //console.log(value.code);
    // //  }).catch(function (err: InsightResponse) {
    // //  console.log(err.code);
    // //  });
    // //  });
    // //
    // //  it("Testing addDataset with picture data", function () {
    // //  let data = fs.readFileSync("./IMG_4436.jpg");
    // //  return facade.addDataset("picture", data).then(function (value: InsightResponse) {
    // //  //expect(value.code).to.equal(400)
    // //  //console.log(value.code);
    // //  }).catch(function (err: InsightResponse) {
    // //  console.log(err.code);
    // //  });
    // //  });
    // //  it("Testing addDataset with valid but useless data", function () {
    // //  let data = fs.readFileSync("./New folder.zip");
    // //  return facade.addDataset("invalid_zip", data).then(function (value: InsightResponse) {
    // //  //expect(value.code).to.equal(400)
    // //  expect.fail();
    // //  }).catch(function (err: InsightResponse) {
    // //  expect(err.code).to.equal(400);
    // //  });
    // //  });
    //
    //  // it("Testing removeDataset with new id", function () {
    //  // return facade.removeDataset("courses").then(function (value: InsightResponse) {
    //  // //expect(value.code).to.equal(404)
    //  // //console.log(value.code);
    //  // }).catch(function (err:InsightResponse) {
    //  // console.log(err.code)
    //  // });
    //  // });
    //  // it("Testing removeDataset with another id", function () {
    //  // return facade.removeDataset("invalid_id").then(function (value: InsightResponse) {
    //  // //expect(value.code).to.equal(404)
    //  // //console.log(value.code);
    //  // }).catch(function (err:InsightResponse) {
    //  // console.log(err.code);
    //  // });
    //  // });
    // it("Testing performQuery1", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "OR":[
    //                 {
    //                     "AND":[
    //                         {
    //                             "GT":{
    //                                 "courses_avg":90
    //                             }
    //                         },
    //                         {
    //                             "IS":{
    //                                 "courses_dept":"adhe"
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "EQ":{
    //                         "courses_avg":95
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "courses_id",
    //                 "courses_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    //
    // it("Testing performQuery2", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "OR":[
    //                 {
    //                     "AND":[
    //                         {
    //                             "GT":{
    //                                 "courses_avg":90
    //                             }
    //                         },
    //                         {
    //                             "IS":{
    //                                 "courses_dept":"adhe"
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "EQ":{
    //                         "courses_avg":95
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "courses_id",
    //                 "courses_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing performQuery3", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "OR": [
    //                 {"IS":{"courses_instructor": "desaulniers, shawn;leung, fok-shuen;sargent, pamela"}},
    //                 {"IS":{"courses_instructor": "sargent, pamela"}}
    //             ]
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "courses_instructor",
    //                 "courses_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing performQuery4", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "AND":[
    //                 {"GT" : {"courses_avg":90}},
    //                 {"LT" : {"courses_avg":85}}
    //             ]
    //
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing performQuery5", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [
    //                 {
    //                     "IS": {
    //                         "courses_dept": "cpsc"
    //                     }
    //                 },
    //                 {
    //
    //                     "GT": {
    //                         "courses_avg": 94
    //                     }
    //                 }
    //             ]
    //
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg"
    //             ],
    //             "ORDER": {"courses_uuid": "courses_avg"},
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    //
    // it("test 424 1 ", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [{
    //                 "GT": {
    //                     "courss_avg": "90"
    //                 }
    //             }, {
    //                 "EQ": {
    //                     "courss_avg": 77
    //                 }
    //
    //             }, {
    //                 "IS": {
    //                     "courses_dept": "cpsc"
    //                 }
    //
    //             }
    //
    //             ]
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(424);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    //
    // it("Testing performQuery", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //
    //             "NOT": {
    //
    //                 "OR": [{
    //                     "GT": {
    //                         "courses_avg": 90
    //                     }
    //                 }, {
    //                     "EQ": {
    //                         "courses_avg": 77
    //                     }
    //
    //                 }, {
    //                     "IS": {
    //                         "courses_dept": "cpsc"
    //                     }
    //
    //                 }
    //                     // ,
    //                     //     {
    //                     //     "LT": {
    //                     //         "courses_avg": 70
    //                     //     }
    //                     // }
    //                 ]
    //             }
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_uuid",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing performQuery", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //
    //             "OR": [
    //                 {
    //                     "NOT": {
    //
    //                         "AND": [{
    //                             "GT": {
    //                                 "courses_avg": "90"
    //                             }
    //                         }, {
    //                             "EQ": {
    //                                 "courss_avg": "77"
    //                             }
    //
    //                         }, {
    //                             "IS": {
    //                                 "course_dept": "cpsc"
    //                             }
    //
    //                         }, {
    //                             "AND": [
    //                                 {
    //                                     "GT": {"courses_avg": 20}
    //                                 }
    //                             ]
    //
    //
    //                         }
    //
    //                         ]
    //
    //
    //                     }
    //                 },
    //                 {
    //                     "IS": {
    //                         "courses_uuid": "129*"
    //                     }
    //
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(424);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing performQuery10", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [{
    //                 "GT": {
    //                     "courses_avg": 70
    //                 }
    //             }, {
    //                 "WE": {
    //                     "courses_dept": "cpsc"
    //                 }
    //
    //             }, {
    //                 "LT": {
    //                     "courses_avg": 71
    //                 }
    //
    //             }
    //
    //             ]
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    // it("Invalid key", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [{
    //                 "GT": {
    //                     // "courses_avg": "90"
    //                 }
    //             }, {
    //                 "EQ": {
    //                     "courss_avg": "77"
    //                 }
    //
    //             }, {
    //                 "IS": {
    //                     "course_dept": "cpsc"
    //                 }
    //
    //             }
    //
    //             ]
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("Testing 400", function () {
    //     return facade.performQuery({
    //         "WHERE": {}
    //         ,
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("400 5", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "NOT":
    //                 {
    //                     "LT":{
    //                         "courses_avg":50
    //                     }
    //                 }
    //
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "stub_id",
    //                 "daddy_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("424 1", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [
    //                 {
    //                     "AND": [
    //                         {
    //                             "GT": {
    //                                 "courses_avg": 63.99
    //                             }
    //                         }
    //                         , {
    //                             "EQ": {
    //                                 "courses_avg": 64
    //                             }
    //                         }
    //                     ]
    //                     ,
    //                     "IS": {
    //                         "courses_avg": 63.99
    //                     }
    //                 }
    //                 , {
    //                     "EQ": {
    //                         "courses_avg": 64
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuisd",
    //                 "courses_title",
    //                 "courses_insftructor",
    //                 "courses_fail",
    //                 "courses_ausddit",
    //                 "courses_pass"
    //             ],
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(424);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("test set of instructor", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "OR": [
    //                 {
    //                     "IS": {
    //                         "courses_instructor": "*hu, a*"
    //                     }
    //                 },
    //                 {
    //                     "IS": {
    //                         "cours_instructor": "*wolfman"
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid",
    //                 "courses_title",
    //                 "courses_instructor",
    //                 "courses_fail",
    //                 "courses_audit",
    //                 "courses_pass"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("test not", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "NOT": {
    //
    //                 "IS": {"courses_dept": "*cpsc*"}
    //             }
    //
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //
    //                 "courses_avg",
    //                 "courses_uuid",
    //                 "courses_dept",
    //                 "courses_instructor"
    //
    //             ],
    //             "ORDER": "courses_uuid",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("bad query", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [{
    //                 "GT": {
    //                     "courses_avg": 60
    //                 }
    //             }, {
    //                 "LT": {
    //                     "courses_avg": 99
    //                 }
    //
    //             },
    //             //     {
    //             //     "IS": {
    //             //         "courses_dept": "cpsc"
    //             //     }
    //             //
    //             // }
    //
    //             ]
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log("777777777777");
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // // it("multiple instructers", function () {
    // //     return facade.performQuery({
    // //         "WHERE":{
    // //             "OR": [
    // //                 {"IS":{"courses_instructor": "desaulniers, shawn;leung, fok-shuen;sargent, pamela"}},
    // //                 {"IS":{"courses_instructor": "sargent, pamela"}}
    // //             ]
    // //         },
    // //         "OPTIONS":{
    // //             "COLUMNS":[
    // //                 "courses_dept",
    // //                 "courses_instructor",
    // //                 "courses_avg"
    // //             ],
    // //             "ORDER":"courses_avg",
    // //             "FORM":"TABLE"
    // //         }
    // //
    // //     }).then(function (value: InsightResponse) {
    // //         expect(value.code).to.equal(200);
    // //         console.log(value.code);
    // //     }).catch(function (err:InsightResponse) {
    // //         console.log(err.code);
    // //     });
    // // });
    //
    //
    // it("400 2", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "OR": [
    //                 {a: 5}
    //
    //             ]
    //         }
    //
    //         ,
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_dept",
    //                 "courses_avg",
    //                 "courses_uuid"
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    //
    // it("400 2", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [
    //                 {
    //                     "IS": {
    //                         "courses_dept": "*cpsc*"
    //                     }
    //                 }
    //                 ,
    //                 {
    //                     "NOT": {
    //                         "IS": {
    //                             "courses_instructor": "hu, alan"
    //                         }
    //                     }
    //
    //                 }
    //
    //             ]
    //
    //
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //
    //                 "courses_uuid",
    //                 "courses_dept",
    //                 "courses_instructor"
    //
    //             ],
    //             "ORDER": "courses_uuid",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    //
    // it("400 2", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //
    //         }
    //
    //         ,
    //         "OPTIONS": {
    //             "COLUMNS": [
    //
    //             ],
    //             "ORDER": "courses_avg",
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    //
    // it("400 2", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "GT":{
    //                 "courses1_avg": "90"
    //
    //             }
    //
    //         }
    //
    //         ,
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "courses_avg",
    //
    //             ],
    //
    //             "FORM": "TABLE"
    //         }
    //
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });
    //
    // it("MULTI", function () {
    //     return facade.performQuery(
    //         {
    //             "WHERE":{
    //                 "OR": [
    //                     {"IS":{"courses_instructor": "desaulniers, shawn;leung, fok-shuen;sargent, pamela"}},
    //                     {"IS":{"courses_instructor": "sargent, pamela"}}
    //                 ]
    //             },
    //             "OPTIONS":{
    //                 "COLUMNS":[
    //                     "courses_dept",
    //                     "courses_instructor",
    //                     "courses_avg"
    //                 ],
    //                 "ORDER":"courses_avg",
    //                 "FORM":"TABLE"
    //             }
    //         }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(400);
    //         console.log(value.code);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });

    // it("AND 3 2", function () {
    //     return facade.performQuery({
    //         "WHERE":{
    //             "OR":[
    //                 {
    //                     "AND":[
    //                         {
    //                             "GT":{
    //                                 "courses_avg":90
    //                             }
    //                         },
    //                         {
    //                             "IS":{
    //                                 "courses_dept":"adhe"
    //                             }
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "EQ":{
    //                         "courses_avg":95
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS":{
    //             "COLUMNS":[
    //                 "courses_dept",
    //                 "courses_id",
    //                 "courses_avg"
    //             ],
    //             "ORDER":"courses_avg",
    //             "FORM":"TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //          console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //     });
    // });

    // it("Testing performQuery1", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "IS": {
    //                 "rooms_name": "DMP_*"
    //             }
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_name"
    //             ],
    //             "ORDER": "rooms_name",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery2", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "IS": {
    //                 "rooms_address": "*Agrono*"
    //             }
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_address", "rooms_name"
    //             ],
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery3 long and lan OR", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "OR": [
    //                 {
    //                     "LT": {
    //                         "rooms_lat": 49.2
    //                     }
    //                 },
    //
    //                 {
    //                     "GT": {
    //                         "rooms_lat": 49.8
    //                     }
    //                 },
    //
    //                 {
    //                     "LT": {
    //                         "rooms_lon":-123.2599
    //                     }
    //                 },
    //
    //                 {
    //                     "GT": {
    //                         "rooms_lon":-123.2442
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_fullname",
    //                 "rooms_shortname",
    //                 "rooms_number",
    //                 "rooms_name",
    //                 "rooms_address",
    //                 "rooms_type",
    //                 "rooms_furniture",
    //                 "rooms_href",
    //                 "rooms_lat",
    //                 "rooms_lon",
    //                 "rooms_seats"
    //             ],
    //             "ORDER": "rooms_name",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery4  long lan  NOT AND", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "NOT": {
    //                 "AND": [{
    //                     "GT": {
    //                         "rooms_lat": 49.2612
    //                     }
    //                 },
    //                     {
    //                         "LT": {
    //                             "rooms_lat": 49.26129
    //                         }
    //                     },
    //                     {
    //                         "LT": {
    //                             "rooms_lon": -123.2480
    //                         }
    //                     },
    //                     {
    //                         "GT": {
    //                             "rooms_lon": -123.24809
    //                         }
    //                     }
    //                 ]
    //             }
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_fullname",
    //                 "rooms_shortname",
    //                 "rooms_number",
    //                 "rooms_name",
    //                 "rooms_address",
    //                 "rooms_type",
    //
    //             ],
    //             "ORDER": "rooms_name",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery5 DMP rooms with long lan(AND & OR)", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "AND": [
    //                 {
    //                     "OR": [
    //                         {
    //                             "GT": {
    //                                 "rooms_seats": 100
    //                             }
    //                         },
    //                         {
    //                             "EQ": {
    //                                 "rooms_seats": 80
    //                             }
    //                         }]
    //                 },
    //                 {
    //                     "IS": {
    //                         "rooms_name": "DMP*"
    //                     }
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_seats",
    //                 "rooms_name"
    //             ],
    //             "ORDER": "rooms_seats",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery6  rooms type small ", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //             "IS": {
    //                 "rooms_type": "*Small*"
    //             }
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_name"
    //             ],
    //             "ORDER": "rooms_name",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    // it("Testing performQuery7  should return empty", function () {
    //     return facade.performQuery({
    //         "WHERE": {
    //
    //             "AND": [
    //                 {
    //                     "NOT": {
    //
    //                         "OR": [{
    //                                 "IS": {
    //                                     "rooms_name": "*DMP*"
    //                                 }
    //                             }, {
    //                                 "IS": {
    //                                     "rooms_name": "*ORCH*"
    //                                 }
    //
    //                             }
    //                         ]
    //
    //                     }
    //                 },
    //                 {
    //                     "IS": {
    //                         "rooms_address": "*Agrono*"
    //                     }
    //
    //                 }
    //             ]
    //         },
    //         "OPTIONS": {
    //             "COLUMNS": [
    //                 "rooms_name"
    //             ],
    //             "ORDER": "rooms_name",
    //             "FORM": "TABLE"
    //         }
    //     }).then(function (value: InsightResponse) {
    //         expect(value.code).to.equal(200);
    //         console.log(value.code);
    //         console.log(value.body);
    //     }).catch(function (err:InsightResponse) {
    //         console.log(err.code);
    //         console.log(err.body);
    //     });
    // });
    //
    it("Testing performQuery8 Find ORCH rooms", function () {
        return facade.performQuery({
            "WHERE": {

                "AND": [
                    {
                        "NOT": {


                                "IS": {
                                    "rooms_name": "*DMP*"
                                }


                        }
                    },
                    {
                        "IS": {
                            "rooms_address": "*Agrono*"
                        }

                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery9 OkelyDokely: Should be able to find all rooms outside a certain bounding box.", function () {
        return facade.performQuery({
            "WHERE": {
                "NOT": {
                    "AND": [{
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                        {
                            "LT": {
                                "rooms_lat": 49.26129
                            }
                        },
                        {
                            "LT": {
                                "rooms_lon": -123.2480
                            }
                        },
                        {
                            "GT": {
                                "rooms_lon": -123.24809
                            }
                        }
                    ]
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery10 error 400  try to query form 2 datasets", function () {
        return facade.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "rooms_name": "DMP_*"
                        }
                    },
                    {
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery11 include course year", function () {
        return facade.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "EQ":{
                            "courses_year":"2007"
                        }
                    },
                    {
                        "GT":{
                            "courses_year":"2006"
                        }
                    }

                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_uuid"
                ],
                "ORDER":"courses_uuid",
                "FORM":"TABLE"
            }
        }).then(function (value: InsightResponse) {
            console.log("6666666666666666666666666");
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log("77777777777777777777");
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery12  furniture", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Classroom-Movable Tables & Chairs*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery13 dummy empty", function () {
        return facade.performQuery({
            "WHERE": {

                "AND": [
                    {
                        "NOT": {


                            "IS": {
                                "rooms_address": "*Agrono*"

                            }


                        }
                    },
                    {
                        "IS": {
                            "rooms_name": "*DMP*"
                        }

                    }
                ]
            },


            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery14 dummy2 empty string ", function () {
        return facade.performQuery({
            "WHERE": {

                "AND": [
                    {
                        "NOT": {


                            "IS": {
                                "rooms_shortname": "*DMP*"

                            }


                        }
                    },
                    {
                        "IS": {
                            "rooms_name": "DMP_*"
                        }

                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery15 Boron find small rooms with large number of seats", function () {
        return facade.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "rooms_seats": 40
                        }
                    },
                    {
                        "IS": {
                            "rooms_type": "*Small*"
                        }
                    }

                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });




    it("Testing performQuery16 400 bad request ", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_qname": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery17 400 Order key needs to be included in columns", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_fullname",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery18 building with no room   empty result", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "*ACU*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery19  Canary Boron  find room in building according to seats", function () {
        return facade.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "OR": [
                            {
                                "GT": {
                                    "rooms_seats": 100
                                }
                            },
                            {
                                "EQ": {
                                    "rooms_seats": 80
                                }
                            }]
                    },
                    {
                        "IS": {
                            "rooms_name": "DMP*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats",
                    "rooms_name"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery20  Einstein: Should be able to find lat and lon given address of a building.", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_address": "6363 Agronomy Road"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_lat",
                    "rooms_lon"
                ],
                "ORDER": "rooms_lat",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });
    //
    it("Testing performQuery21  Fluorine: Should be able to find the year a course is offered in.", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "courses_title": "teach adult"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_year"
                ],
                "ORDER": "courses_year",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery22 Germanium: Should be able to find rooms with tables.", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery23 Gallium: Filter by courses year.", function () {
        return facade.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "GT":{
                            "courses_year":2006
                        }
                    },
                    {
                        "LT":{
                            "courses_year":2008
                        }
                    }

                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_uuid"
                ],
                "ORDER":"courses_uuid",
                "FORM":"TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery24 Googolplex: Filter by room fullnames.", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_fullname": "*Angus*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery25 Hopper: Filter by room names", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery26 Helium: Filter by partial href.", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_href": "*ANGU*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery26 Hydrogen: Should be able to find hyperlink for rooms", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_href"
                ],
                "ORDER": "rooms_href",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery27 Kleene: Find all group type rooms without some furniture.", function () {
        return facade.performQuery({
            "WHERE": {
                "NOT":{
                    "IS": {
                        "rooms_furniture": "*Chairs*"
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery28 Knuth: Find all studio type rooms without some furniture.", function () {
        return facade.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "IS":{
                            "rooms_type":"*Studio*"
                        }
                    },
                    {
                        "NOT":{
                                "IS": {
                                    "rooms_furniture": "*Chairs*"
                                }
                        }
                    }

                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "rooms_name"
                ],
                "ORDER":"rooms_name",
                "FORM":"TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery29 Leo: Find all group type rooms in a specific building which can fit more than some number of people.", function () {
        return facade.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "IS":{
                            "rooms_type":"*Group*"
                        }
                    },
                    {
                        "IS":{
                            "rooms_name":"*BUCH*"
                        }
                    },
                    {
                        "GT":{
                            "rooms_seats":25
                        }
                    }

                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "rooms_name"
                ],
                "ORDER":"rooms_name",
                "FORM":"TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery30 Liberation: Find all non-studio type rooms with certain number of seats, excluding a specific building.", function () {
        return facade.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "NOT":{
                                "IS": {
                                    "rooms_type": "*Studio*"
                                }
                        }
                    },
                    {
                        "NOT":{
                            "IS": {
                                "rooms_name": "*MATH_225*"
                            }
                        }
                    },
                    {
                        "EQ":{
                            "rooms_seats":25
                        }
                    }

                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "rooms_name"
                ],
                "ORDER":"rooms_name",
                "FORM":"TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });
    //
    it("Testing performQuery31 OkelyDokely: Should be able to find all rooms outside a certain bounding box.", function () {
        return facade.performQuery({
            "WHERE": {
                "NOT": {
                    "AND": [{
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                        {
                            "LT": {
                                "rooms_lat": 49.26129
                            }
                        },
                        {
                            "LT": {
                                "rooms_lon": -123.2480
                            }
                        },
                        {
                            "GT": {
                                "rooms_lon": -123.24809
                            }
                        }
                    ]
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery32 Odyssey: Should be able to find all rooms within a certain bounding box..", function () {
        return facade.performQuery({
            "WHERE": {

                    "AND": [{
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                        {
                            "LT": {
                                "rooms_lat": 49.26129
                            }
                        },
                        {
                            "LT": {
                                "rooms_lon": -123.2480
                            }
                        },
                        {
                            "GT": {
                                "rooms_lon": -123.24809
                            }
                        }
                    ]

            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });
    //



    //
    // it("Testing removeDataset with new id", function () {
    // return facade.removeDataset("courses").then(function (value: InsightResponse) {
    // //expect(value.code).to.equal(404)
    // //console.log(value.code);
    // }).catch(function (err:InsightResponse) {
    // console.log(err.code)
    // });
    // });


    it("Testing removeDataset with existing id", function () {
        return facade.removeDataset("rooms").then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });



});