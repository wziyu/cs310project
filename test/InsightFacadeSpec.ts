import {expect} from 'chai';
import Server from "../src/rest/Server";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
let fs = require("fs");
let chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe("InsightFacadeSpec", function () {

    let facade: InsightFacade = null;
    let server = new Server(4321);

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

    it("Testing server: PUT 201", function (done) {
        server.start().then(function () {
            let zipdata = fs.readFileSync("testData/rooms.zip");
            chai.request("http://localhost:4321")
                .put('/dataset/rooms')
                .attach("body", zipdata, "rooms.zip")
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-1 200", function (done) {
        server.start().then(function () {
            let query = {
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
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-2 200", function (done) {
        server.start().then(function () {
            let query = {
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
                                "rooms_lon": -123.2599
                            }
                        },

                        {
                            "GT": {
                                "rooms_lon": -123.2442
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
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-3 200", function (done) {
        server.start().then(function () {
            let query = {
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
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-4 400 duplicated keys", function (done) {
        server.start().then(function () {
            let query = {
                "WHERE": {"AND": [{"IS": {"rooms_furniture": "*Tables*"}}, {"GT": {"rooms_seats": 300}}]},
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_shortname",
                        "rooms_address",
                        "totalSeats",
                        "avgSeats"],
                    "ORDER": {
                        "dir": "DOWN",
                        "keys": ["totalSeats"]
                    },
                    "FORM": "TABLE"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname", "rooms_address"],
                    "APPLY": [{
                        "totalSeats": {
                            "SUM": "rooms_seats"
                        }
                    },
                        {
                            "avgSeats": {
                                "AVG": "rooms_seats"
                            }
                        },
                        {
                            "avgSeats": {
                                "AVG": "rooms_seats"
                            }
                        }

                    ]
                }
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-5 400 underscore keys", function (done) {
        server.start().then(function () {
            let query = {
                "WHERE": {"AND": [{"IS": {"rooms_furniture": "*Tables*"}}, {"GT": {"rooms_seats": 300}}]},
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_shortname",
                        "rooms_address",
                        "totalSeats",
                        "avgSeats"],
                    "ORDER": {
                        "dir": "DOWN",
                        "keys": ["totalSeats"]
                    },
                    "FORM": "TABLE"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname", "rooms_address"],
                    "APPLY": [{
                        "total_Seats": {
                            "SUM": "rooms_seats"
                        }
                    },
                        {
                            "avgSeats": {
                                "AVG": "rooms_seats"
                            }
                        }
                    ]
                }
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-6 200 correct with 3 rows", function (done) {
        server.start().then(function () {
            let query = {
                "WHERE": {"AND": [{"IS": {"rooms_furniture": "*Tables*"}}, {"GT": {"rooms_seats": 300}}]},
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_shortname",
                        "rooms_address",
                        "totalSeats"],
                    "ORDER": {
                        "dir": "DOWN",
                        "keys": ["totalSeats"]
                    },
                    "FORM": "TABLE"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname", "rooms_address"],
                    "APPLY": [{
                        "totalSeats": {
                            "SUM": "rooms_seats"
                        }
                    },
                        {
                            "avgSeats": {
                                "AVG": "rooms_seats"
                            }
                        }
                    ]
                }
            };
            chai.request("http://localhost:4321")
                .post('/query')
                .send(query)
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-7 200 correct with empty where", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {},
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_furniture"
                        ],
                        "ORDER": "rooms_furniture",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_furniture"],
                        "APPLY": []
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-8 200 correct with empty where", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {},
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_seats"
                        ],
                        "ORDER": "rooms_seats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_seats"],
                        "APPLY": []
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-9 200 correct max seats", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_shortname",
                            "maxSeats"
                        ],
                        "ORDER": "maxSeats",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_shortname", "rooms_name"],
                        "APPLY": [{
                            "maxSeats": {
                                "MAX": "rooms_seats"
                            }
                        }]
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-10 200 correct", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "AND": [
                            {"GT": {"courses_year": 2014}},
                            {"IS": {"courses_dept": "cp*"}}
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_instructor",
                            "avgGrade"
                        ],
                        "ORDER": "avgGrade",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["courses_dept", "courses_instructor"],
                        "APPLY": [{
                            "avgGrade": {
                                "AVG": "courses_avg"
                            }
                        }]
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-10 200 correct rows with count 1", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {},
                    "OPTIONS": {
                        "COLUMNS": [
                            "rooms_furniture",
                            "countRows"
                        ],
                        "ORDER": "rooms_furniture",
                        "FORM": "TABLE"
                    },
                    "TRANSFORMATIONS": {
                        "GROUP": ["rooms_furniture"],
                        "APPLY": [{
                            "countRows": {
                                "COUNT": "rooms_furniture"
                            }
                        }]
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 1 400 incorrect", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "AND": [{
                            "GT": {
                                "courses_avg": "90"
                            }
                        }, {
                            "EQ": {
                                "courss_avg": "77"
                            }

                        }, {
                            "IS": {
                                "course_dept": "cpsc"
                            }
                        }
                        ]

                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg",
                            "courses_uuid"
                        ],
                        "ORDER": "courses_avg",
                        "FORM": "TABLE"
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 2 400 incorrect", function (done) {
        server.start().then(function () {

            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE":{
                        "NOT":
                            {
                                "LT":{
                                    "courses_avg":50
                                }
                            }

                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "stub_id",
                            "daddy_avg"
                        ],
                        "ORDER":"courses_avg",
                        "FORM":"TABLE"
                    }
                })
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 3 424 incorrect", function (done) {
        server.start().then(function () {
            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "AND": [{
                            "GT": {
                                "courses1_avg": "90"
                            }
                        }, {
                            "EQ": {
                                "courses2_avg": 77
                            }

                        }, {
                            "IS": {
                                "course_dept": "cpsc"
                            }

                        }

                        ]

                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg",
                            "courses_uuid"
                        ],
                        "ORDER": "courses_avg",
                        "FORM": "TABLE"
                    }
                }).end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 4 400 incorrect", function (done) {
        server.start().then(function () {
            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "OR": [
                            {a: 5}

                        ]
                    }

                    ,
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg",
                            "courses_uuid"
                        ],
                        "ORDER": "courses_avg",
                        "FORM": "TABLE"
                    }
                }).end(function (err: any, res: any) {
                console.log(res.body);
                server.stop().then();
                done();
            });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 4 200 correct", function (done) {
        server.start().then(function () {
            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE": {
                        "AND": [
                            {
                                "IS": {
                                    "courses_dept": "cpsc"
                                }
                            },
                            {
                                "GT": {
                                    "courses_avg": 94
                                }
                            }
                        ]
                    },
                    "OPTIONS": {
                        "COLUMNS": [
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER": {"courses_uuid": "courses_avg"},
                        "FORM": "TABLE"
                    }
                }).end(function (err: any, res: any) {
                console.log(res.body);
                server.stop().then();
                done();
            });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    it("Testing server: POST-d1/d2 5 200 correct", function (done) {
        server.start().then(function () {
            chai.request("http://localhost:4321")
                .post('/query')
                .send({
                    "WHERE":{
                        "GT":{
                            "courses_avg":97
                        }
                    },
                    "OPTIONS":{
                        "COLUMNS":[
                            "courses_dept",
                            "courses_avg"
                        ],
                        "ORDER":"courses_avg",
                        "FORM":"TABLE"
                    }
                }).end(function (err: any, res: any) {
                console.log(res.body);
                server.stop().then();
                done();
            });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });

    xit("Testing server: DEL 204", function (done) {
        server.start().then(function () {
            chai.request("http://localhost:4321")
                .del('/dataset/rooms')
                .end(function (err: any, res: any) {
                    console.log(res.body);
                    server.stop().then();
                    done();
                });
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();
        });
    });
});
