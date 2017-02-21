/**
 * Created by yhyma on 1/23/2017.
 */

import {expect} from 'chai';
import Server from "../src/rest/Server";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
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


    it("Testing addDataset with new room id", function () {
        let data = fs.readFileSync("testData/rooms.zip");
        //console.log(data);
        return facade.addDataset("rooms", data).then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing addDataset with new room id", function () {
        let data = fs.readFileSync("testData/courses.zip");
        //console.log(data);
        return facade.addDataset("courses", data).then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing performQuery invalid query1", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
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

    it("Testing performQuery invalid query2", function () {
        return facade.performQuery({
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

    it("Testing performQuery invalid query3", function () {
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

    it("Testing performQuery invalid query4", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
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

    it("Testing performQuery invalid query5", function () {
        let target:QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE",
            }
        };

        return facade.performQuery(target).then(function (value: InsightResponse) {
            expect(value.code).to.equal(200);
            console.log(value.code);
            console.log(value.body);
        }).catch(function (err:InsightResponse) {
            console.log(err.code);
            console.log(err.body);
        });
    });

    it("Testing performQuery1", function () {
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

    it("Testing performQuery2", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
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

    it("Testing performQuery3 long and lan OR", function () {
        return facade.performQuery({
            "WHERE": {
                "OR": [
                    {
                        "LT": {
                            "rooms_lat": 49.2
                        }
                    },

                    {
                        "GT": {
                            "rooms_lat": 49.8
                        }
                    },

                    {
                        "LT": {
                            "rooms_lon":-123.2599
                        }
                    },

                    {
                        "GT": {
                            "rooms_lon":-123.2442
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
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

    it("Testing performQuery4  long lan  NOT AND", function () {
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
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type"

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

    it("Testing performQuery5 DMP rooms with long lan EMPTY", function () {
        return facade.performQuery({
            "WHERE": {

                    "AND": [
                        {
                            "GT": {
                                "rooms_lat": 10
                            }
                        },
                        {
                            "LT": {
                                "rooms_lat": 100
                            }
                        },
                        {
                            "IS": {
                                "rooms_name": "DMP"
                            }
                        }
                    ]
                },

            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type"
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

    it("Testing performQuery6  rooms type small ", function () {
        return facade.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_type": "*Small*"
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

    it("Testing performQuery7  should return empty", function () {
        return facade.performQuery({
            "WHERE": {

                "AND": [
                    {
                        "NOT": {

                            "OR": [{
                                    "IS": {
                                        "rooms_name": "*DMP*"
                                    }
                                }, {
                                    "IS": {
                                        "rooms_name": "*ORCH*"
                                    }

                                }
                            ]

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
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
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
                            "courses_year":2007
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"cpsc"
                        }
                    },
                    {
                        "IS":{
                            "courses_id":"121"
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

    it("Testing performQuery15 find small rooms with large number of seats", function () {
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

    it("Testing performQuery18 valid query to find course year 2015", function () {
        return facade.performQuery({
            "WHERE":{
            "AND": [
                {
                    "EQ":{
                        "courses_avg":98.98
                    }
                },
                {
                    "EQ":{
                        "courses_year": 2015
                    }
                }
            ]
        },
            "OPTIONS":{
            "COLUMNS":[
                "courses_year",
                "courses_avg",
                "courses_dept"
            ],
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

    it("Testing performQuery19 find room in building according to seats", function () {
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


    it("Testing removeDataset with existing id", function () {
        return facade.removeDataset("courses").then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing removeDataset with existing id", function () {
        return facade.removeDataset("rooms").then(function (value: InsightResponse) {
            expect(value.code).to.equal(204)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });


});