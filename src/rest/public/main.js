/**
 * Created by yhyma on 3/22/2017.
 */
$(document).ready(function(){

    generateOptions("courses_dept").then(function (res) {
        $("#inlineFormCustomSelect1").append(res);
    });
    generateOptions("courses_id").then(function (res) {
        $("#inlineFormCustomSelect2").append(res);
    });
    generateOptions("rooms_shortname").then(function (res) {
        $("#inlineFormCustomSelect3").append(res);
    });
    $('.navbar-nav a').click(function()
    {
        $("#output_body").empty();
        $(this).tab('show');

    });
    $("#courses_submit").click(function(e)
    {
        e.preventDefault();
        var query = {};
        var and = [];
        var temp;
        var dept = $("#dept").val().toLowerCase();
        if (dept.length > 0) {
            temp = {"IS": {}};
            temp.IS.courses_dept = dept;
            and.push(temp);
        }
        var num = $("#num").val();
        if (num.length > 0) {
            temp = {"IS": {}};
            temp.IS.courses_id = num;
            and.push(temp);
        }
        var instructor = $("#instructor").val();
        if (instructor.length > 0) {
            temp = {"IS": {}};
            temp.IS.courses_instructor = instructor;
            and.push(temp);
        }
        var title = $("#title").val();
        if (title.length > 0) {
            temp = {"IS": {}};
            temp.IS.courses_title = title;
            and.push(temp);
        }
        if (and.length !== 0)
            query.WHERE = {"AND": and};
        else
            query.WHERE = {};
        var size = $("#size").val();
        var cols = ["courses_dept", "courses_id", "courses_instructor", "courses_title"];
        if (size.length > 0) {
            cols.push("courses_pass");
            cols.push("courses_fail");
        }
        $('#sel0 option:selected').each(function () {
            switch (this.value) {
                case "Average":
                    cols.push("courses_avg");
                    break;
                case "Failing Count":
                    cols.push("courses_fail");
                    break;
                case "Passing Count":
                    cols.push("courses_pass");
                    break;
                case "Year":
                    cols.push("courses_year");
                    break;
                case "Other Trivial Info":
                    cols.push("courses_audit");
                    cols.push("courses_uuid");
                    break;

            }
        });
        query.OPTIONS = {};
        query.OPTIONS.COLUMNS = cols;
        var ops = [];
        $('#sel1 option:selected').each(function () {
            ops.push(this.value);
        });
        var order = [];
        $('#sel2 option:selected').each(function () {
            order.push(this.value);
        });
        if (order.length > 1) {
            query.OPTIONS.ORDER = {};
            query.OPTIONS.ORDER.dir = "DOWN";
            query.OPTIONS.ORDER.keys = order;
        }
        else
            query.OPTIONS.ORDER = order[0];
        query.OPTIONS.FORM = "TABLE";
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4321/query',
            data: JSON.stringify(query),
            contentType: "application/json",
            dataType: 'json',
            success: function (data) {
                var result = data.result;
                if (size.length > 0 && ops.length >= 0)
                    result = processResultBySize(result, size, ops, "courses");
                buildHtmlTable(result, $("#output_body"));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus);
                alert("Error: " + errorThrown);
            }
        });
    });
    $("#rooms_submit").click(function(e)
    {
        e.preventDefault();
        var query2 = {};
        var r_and = [];
        var r_temp;
        var fullname = $("#fullname").val();
        if(fullname.length > 0) {
            r_temp = {"IS": {}};
            r_temp.IS.rooms_fullname = fullname;
            r_and.push(r_temp);
        }
        var shortname = $("#shortname").val();
        if(shortname.length > 0) {
            r_temp = {"IS": {}};
            r_temp.IS.rooms_shortname = shortname;
            r_and.push(r_temp);
        }
        var number = $("#number").val();
        if(number.length > 0) {
            r_temp = {"IS": {}};
            r_temp.IS.rooms_number = number;
            r_and.push(r_temp);
        }
        var seats = $("#seats").val();
        var type = $("#type").val();
        if(type.length > 0) {
            r_temp = {"IS": {}};
            r_temp.IS.rooms_type = type;
            r_and.push(r_temp);
        }
        var furniture = $("#furniture").val();
        if(furniture.length > 0) {
            temp = {"IS": {}};
            temp.IS.rooms_furniture = furniture;
            r_and.push(r_temp);
        }
        var target = $("#target").val();
        var range = $("#range").val();
        if(r_and.length !== 0)
            query2.WHERE = {"AND": r_and};
        else
            query2.WHERE = {};
        var r_cols = ["rooms_fullname",
            "rooms_shortname",
            "rooms_number",
            "rooms_seats",
            "rooms_furniture",
            "rooms_type",
            "rooms_furniture"];
        if(target.length > 0 && range.length > 0) {
            r_cols.push("rooms_lon");
            r_cols.push("rooms_lat");
        }
        $('#sel3 option:selected').each(function(){
            switch(this.value) {
                case "Address":
                    r_cols.push("rooms_address");
                    break;
                case "Longitude":
                    r_cols.push("rooms_lon");
                    break;
                case "Latitude":
                    r_cols.push("rooms_lat");
                    break;
                case "Other Trivial Info":
                    r_cols.push("rooms_href");
                    break;
            }
        });
        query2.OPTIONS = {};
        query2.OPTIONS.COLUMNS = r_cols;

        var r_ops = [];
        $('#sel4 option:selected').each(function(){
            r_ops.push(this.value);
        });
        var r_order = [];
        $('#sel5 option:selected').each(function(){
            r_order.push(this.value);
        });
        if(r_order.length > 1) {
            query2.OPTIONS.ORDER = {};
            query2.OPTIONS.ORDER.dir = "DOWN";
            query2.OPTIONS.ORDER.keys = r_order;
        }
        else
            query2.OPTIONS.ORDER = r_order[0];
        query2.OPTIONS.FORM = "TABLE";

        $.ajax({
            type: 'POST',
            url: 'http://localhost:4321/query',
            data: JSON.stringify(query2),
            contentType: "application/json",
            dataType: 'json',
            success: function (data) {
                var r_result = data.result;
                if(target.length>0 && range.length>0) {
                    filterByDist(r_result, target, range).then(function(data){
                        r_result = data;
                        if(seats.length>0 && r_ops.length>=0)
                            r_result = processResultBySize(r_result, seats, r_ops, "rooms");
                        buildHtmlTable(r_result, $("#output_body"));
                    }).catch(function (err){
                        alert(err);
                    })
                }
                else
                {
                    if (seats.length > 0 && r_ops.length >= 0)
                        r_result = processResultBySize(r_result, seats, r_ops, "rooms");
                    buildHtmlTable(r_result, $("#output_body"));
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });

    });
    $("#s5").click(function (e)
    {
        e.preventDefault();
        var dept = [$("#inlineFormCustomSelect1").val()];
        $("#course_sel").empty();
        locateByParams(dept, "courses").then(function (res){
            var str = "";
            for (var i = 0; i < res.length; i++) {
                str += "<option>" + res[i]["courses_dept"] + " "
                    + res[i]["courses_id"]
                    + "</option>";
            }
            $("#course_sel").append(str);
        });

    });
    $("#s4").click(function (e)
    {
        e.preventDefault();
        var number = [$("#inlineFormCustomSelect2").val()];
        $("#course_sel").empty();
        locateByParams(number, "courses").then(function (res){
            var str = "";
            for (var i = 0; i < res.length; i++) {
                str += "<option>" + res[i]["courses_dept"] + " "
                    + res[i]["courses_id"]
                    + "</option>";
            }
            $("#course_sel").append(str);
        });

    });
    $("#s3").click(function (e)
    {
        e.preventDefault();
        var d = $("#d").val().toLowerCase();
        var n = $("#n").val();
        var temp = d + " " + n;
        var param = [temp];
        $("#course_sel").empty();
        if(d.length>0 && n.length>0) {
            locateByParams(param, "courses").then(function (res) {
                var str = "";
                for (var i = 0; i < res.length; i++) {
                    str += "<option>" + res[i]["courses_dept"] + " "
                        + res[i]["courses_id"]
                        + "</option>";
                }
                $("#course_sel").append(str);
            });
        }

    });
    $("#s1").click(function (e)
    {
        e.preventDefault();
        var building = [$("#inlineFormCustomSelect3").val()];
        $("#room_sel").empty();
        locateByParams(building, "rooms").then(function (res){
            var str = "";
            for (var i = 0; i < res.length; i++) {
                str += "<option>" + res[i]["rooms_name"] + " "
                    + res[i]["rooms_seats"]
                    + "</option>";
            }
            $("#room_sel").append(str);
        });
    });
    $("#s2").click(function (e)
    {
        e.preventDefault();
        var t = $("#t").val();
        var r = $("#r").val();
        var params = [];
        $("#room_sel").empty();
        if(t.length>0 && r.length>0) {
            locateByParams(params, "rooms").then(function (res) {
                filterByDist(res, t, r).then(function (response) {
                    var str = "";
                    for (var i = 0; i < response.length; i++) {
                        str += "<option>" + response[i]["rooms_name"] + " "
                            + response[i]["rooms_seats"]
                            + "</option>";
                    }
                    $("#room_sel").append(str);
                });
            });
        }
    });
    $("#a1").click(function (e)
    {
        e.preventDefault();
        var courses = [];
        $('#course_sel option:selected').each(function () {
            courses.push(this.value);
        });
        for(var i=0; i<courses.length; i++)
        {
            $("#p1").append("<p>" + courses[i] + ";</p>");
        }
    });
    $("#a2").click(function (e)
    {
        e.preventDefault();
        var rooms = [];
        $('#room_sel option:selected').each(function () {
            rooms.push(this.value);
        });
        for(var i=0; i<rooms.length; i++)
        {
            $("#p2").append("<p>" + rooms[i] + ";</p>");
        }
    });
    $("#r1").click(function (e)
    {
        e.preventDefault();
        $("#p1").empty();
    });
    $("#r2").click(function (e)
    {
        e.preventDefault();
        $("#p2").empty();
    });
    $("#confirm").click(function (e)
    {
        e.preventDefault();
        var course_params = $("#p1").text().split(";");
        var room_params = $("#p2").text().split(";");
        if(course_params.length >= 2 && room_params.length >= 2) {
            var course_list = [];
            var rooms_list = [];
            for(var i=0; i<room_params.length-1;i++)
            {
                var name = room_params[i].split(" ")[0];
                var seats = room_params[i].split(" ")[1];
                var obj={"rooms_name": name, "rooms_seats": seats};
                rooms_list.push(obj);
            }

            generateCourses(course_params).then(function (res){
                course_list = res;
                // use rooms_list and course_list to do your scheduling
                // generate an output list by your scheduler then I will write build time table functions
            });
        }
    });
});

function generateCourses(list)
{
    return new Promise(function (resolve, reject) {
        var query = {};
        var or = [];
        for (var i = 0; i < list.length - 1; i++) {
            var arr = [];
            var is = {"IS": {}};
            is.IS.courses_dept = list[i].split(" ")[0];
            var is2 = {"IS": {}};
            is2.IS.courses_id = list[i].split(" ")[1];
            var eq = {"EQ": {}};
            eq.EQ.courses_year = 2014;
            arr.push(is);
            arr.push(is2);
            arr.push(eq);
            var obj = {"AND": arr};
            or.push(obj);
        }
        query.WHERE = {"OR": or};
        query.OPTIONS = {};
        query.OPTIONS.COLUMNS = [
            "courses_dept",
            "courses_id",
            "courses_uuid",
            "countid",
            "maxpass",
            "maxfail"
        ];
        query.OPTIONS.ORDER = {
            "dir": "UP",
            "keys": ["courses_dept", "courses_id"]
        };
        query.OPTIONS.FORM = "TABLE";
        query.TRANSFORMATIONS = {
            "GROUP": ["courses_dept", "courses_id", "courses_uuid"],
            "APPLY": [
                {
                    "countid": {
                        "COUNT": "courses_uuid"
                    }
                },
                {
                    "maxpass": {
                        "MAX": "courses_pass"
                    }
                },
                {
                    "maxfail": {
                        "MAX": "courses_fail"
                    }
                }
            ]
        };
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4321/query',
            data: JSON.stringify(query),
            contentType: "application/json",
            dataType: 'json'
        }).done(function (data) {
            resolve(data.result);
        }).fail(function (err) {
            reject(err);
        });
    });
}
function locateByParams(params, id)
{
    return new Promise(function (resolve, reject){
        var query = {};
        if(id === "courses")
        {
            var and_obj = {};
            if(isNaN(params[0]) && params[0].split(" ").length < 2)
            {
                var obj = {"IS": {}};
                obj.IS.courses_dept = params[0];
                var and = [];
                var obj1 = {"EQ": {}};
                obj1.EQ.courses_year = 2014;
                and.push(obj);
                and.push(obj1);
                and_obj = {"AND": and};
                query.WHERE = and_obj;
                if(params[0] === "Department" || params[0] === "Number")
                    query.WHERE = {};
            }
            else if(!isNaN(params[0]) && params[0].split(" ").length < 2)
            {
                var obj2 = {"IS": {}};
                obj2.IS.courses_id = params[0];
                var and1 = [];
                var obj3 = {"EQ": {}};
                obj3.EQ.courses_year = 2014;
                and1.push(obj3);
                and1.push(obj2);
                and_obj = {"AND": and1};
                query.WHERE = and_obj;
            }
            else if(params[0].split(" ").length === 2)
            {
                var v1 = params[0].split(" ")[0];
                var v2 = params[0].split(" ")[1];
                var o = {"IS": {}};
                o.IS.courses_dept = v1;
                var o2 = {"IS": {}};
                o2.IS.courses_id = v2;
                var and3 = [];
                var obj4 = {"EQ": {}};
                obj4.EQ.courses_year = 2014;
                and3.push(o);
                and3.push(o2);
                and3.push(obj4);
                and_obj = {"AND": and3};
                query.WHERE = and_obj;
            }
            query.OPTIONS = {};
            query.OPTIONS.COLUMNS =
                [
                    'courses_dept',
                    'courses_id'
                ];
            query.OPTIONS.ORDER = "courses_id";
            query.OPTIONS.FORM = "TABLE";
            query.TRANSFORMATIONS = {};
            query.TRANSFORMATIONS.GROUP = ['courses_id', 'courses_dept'];
            query.TRANSFORMATIONS.APPLY = [];
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4321/query',
                data: JSON.stringify(query),
                contentType: "application/json",
                dataType: 'json'
            }).done(function(data) {
                resolve(data.result);
            }).fail(function (err){
                reject(err);
            });
        }
        else if(id === "rooms")
        {

            if(params.length === 1) {
                var temp = {"IS": {}};
                temp.IS.rooms_shortname = params[0];
                query.WHERE = temp;
            }
            else
                query.WHERE = {};
            query.OPTIONS = {};
            query.OPTIONS.COLUMNS =
                [
                    'rooms_shortname',
                    'rooms_fullname',
                    'rooms_name',
                    'rooms_seats',
                    'rooms_type',
                    'rooms_furniture',
                    'rooms_lat',
                    'rooms_lon',
                    'rooms_address'
                ];
            query.OPTIONS.ORDER = "rooms_seats";
            query.OPTIONS.FORM = "TABLE";
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4321/query',
                data: JSON.stringify(query),
                contentType: "application/json",
                dataType: 'json'
            }).done(function(data) {
                resolve(data.result);
            }).fail(function (err){
                reject(err);
            });
        }
    });
}

function generateOptions(key)
{
    return new Promise(function (resolve, reject){
        var query = {};
        query.WHERE = {};
        query.OPTIONS = {};
        query.OPTIONS.COLUMNS = [key];
        query.OPTIONS.ORDER = key;
        query.OPTIONS.FORM = "TABLE";
        query.TRANSFORMATIONS = {};
        query.TRANSFORMATIONS.GROUP = [key];
        query.TRANSFORMATIONS.APPLY = [];
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4321/query',
            data: JSON.stringify(query),
            contentType: "application/json",
            dataType: 'json'
        }).done(function(data) {
            var str = "";
            for(var i=0; i<data.result.length; i++)
            {
                if(i===0 && key==="courses_dept")
                    str += "<option selected>" + "Department" + "</option>";
                else if(i===0 && key==="courses_id")
                    str += "<option selected>" + "Number" + "</option>";
                else if(i===0 && key==="rooms_shortname")
                    str += "<option selected>" + "Building" + "</option>";
                else
                    str += "<option value=" + data.result[i][key] + ">" + data.result[i][key].toUpperCase() + "</option>";
            }
            resolve(str);
        }).fail(function (err){
            reject(err);
        });
    });
}


function buildHtmlTable(arr, selector) {
    selector.empty();
    if(arr.length === 0)
        return;
    var col_names = Object.keys(arr[0]);
    //add column names
    var entry = "<table>";
    for(var i=0; i<col_names.length;i++)
    {
        if(i===0) {
            entry += "<tr>";
            entry += "<th>";
            entry += col_names[i];
            entry += "</th>";
        }
        else if(i===col_names.length-1) {
            entry += "<th>";
            entry += col_names[i];
            entry += "</th>";
            entry += "</tr>";
        }
        else {
            entry += "<th>";
            entry += col_names[i];
            entry += "</th>";
        }
    }
    for(var j=0; j<arr.length;j++)
    {
        var obj = arr[j];
        var obj_keys = Object.keys(obj);
        entry += "<tr>";
        for(var k=0; k<obj_keys.length; k++)
        {
            entry += "<td>";
            entry += obj[obj_keys[k]];
            entry += "</td>";
        }
        entry += "</tr>"
    }
    entry += "</table>";
    selector.append(entry);
}

function buildTimeTable(arr, selector){

}

function processResultBySize(result, size, ops, id){
    var processed = [];
    var op = combineOps(ops);
    for(var i=0; i<result.length; i++)
    {
        var count = 0;
        if(id === "courses")
            count = result[i]["courses_fail"] + result[i]["courses_pass"];
        else if(id === "rooms")
            count = result[i].rooms_seats;
        switch (op)
        {
            case "ge":
                if(count >= size)
                    processed.push(result[i]);
                break;
            case "le":
                if(count <= size)
                    processed.push(result[i]);
                break;
            case "ne":
                if(count !== size)
                    processed.push(result[i]);
                break;
            case "none":
                processed.push(result[i]);
                break;
            case "gt":
                if(count > size)
                    processed.push(result[i]);
                break;
            case "lt":
                if(count < size)
                    processed.push(result[i]);
                break;
            case "eq":
                if(count === size)
                    processed.push(result[i]);
                break;
        }
    }
    return processed;
}

function combineOps(ops)
{
    var final_op = "";
    if(ops.length === 2)
    {
        if (ops.indexOf("Greater Than") >= 0 && ops.indexOf("Equal") >= 0)
            final_op = "ge";
        else if(ops.indexOf("Less Than") >= 0 && ops.indexOf("Equal") >= 0)
            final_op = "le";
        else if(ops.indexOf("Greater Than") >= 0 && ops.indexOf("Less Than") >= 0)
            final_op = "ne";
    }
    else if(ops.length === 3 || ops.length === 0)
        final_op = "none";
    else
    {
        if (ops.indexOf("Greater Than") >= 0)
            final_op = "gt";
        else if(ops.indexOf("Less Than") >= 0)
            final_op = "lt";
        else if(ops.indexOf("Equal") >= 0)
            final_op = "eq";
    }
    return final_op;
}

function filterByDist(result, target, range)
{
    return new Promise(function (resolve, reject){
        var out = [];
        var q = {};
        var o = [];
        if(target.length > 0)
        {
            var t1 = {"IS": {}};
            t1.IS.rooms_fullname = target;
            var t2 = {"IS": {}};
            t2.IS.rooms_shortname = target.toUpperCase();
            o.push(t1);
            o.push(t2);
        }
        q.WHERE = {"OR": o};
        q.OPTIONS = {};
        q.OPTIONS.COLUMNS = ["rooms_lat","rooms_lon"];
        q.OPTIONS.FORM = "TABLE";
        var tlat = 0;
        var tlon = 0;
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4321/query',
            data: JSON.stringify(q),
            contentType: "application/json",
            dataType: 'json'
        }).done(function(data) {
            tlat = data.result[0].rooms_lat;
            tlon = data.result[0].rooms_lon;
            for(var i=0; i<result.length; i++)
            {
                var d = distance(tlat, tlon, result[i].rooms_lat, result[i].rooms_lon, "K")*1000;
                if(d <= range)
                    out.push(result[i]);
            }
            resolve(out);
        }).fail(function (err){
            reject(err);
        });

    })

}

function distance(lat1, lon1, lat2, lon2, unit)
{
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit==="K") { dist = dist * 1.609344 }
    if (unit==="N") { dist = dist * 0.8684 }
    return dist;
}

//paste and modify your functions here, do not paste your functions within my functions