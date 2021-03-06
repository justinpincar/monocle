$(function () {
    var d=new Date();
    var weekday=new Array(7);
    weekday[0]="Sun";
    weekday[1]="Mon";
    weekday[2]="Tue";
    weekday[3]="Wed";
    weekday[4]="Thu";
    weekday[5]="Fri";
    weekday[6]="Sat";
    d.setUTCHours(0, 0, 0, 0);
    var start_block = d.getTime() - 1000*60*60*24*7;

    // Grab the data
    var blocks = [],
        dts = [],
        lbls = [],
        bgs = [],
        colors = [],
        dots = [],
        timeouts = [],
        data = [],
        axisx = [],
        axisy = [],
        table = $("#for-chart");

    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.href);
      if(results == null)
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var day = d.getUTCDay();
    for (var i=0; i < 8; i++) {
        axisy.push(weekday[(day + i) % 7]);
    };
    $("tfoot th", table).each(function () {
        axisx.push($(this).text());
    });

    // Draw
    var width = 800,
        height = 340,
        leftgutter = 30,
        bottomgutter = 20,
        r = Raphael("chart", width, height),
        txt = {"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#444444"},
        X = (width - leftgutter) / axisx.length,
        Y = (height - bottomgutter) / axisy.length,
        color = $("#chart").css("color");
        max = Math.round(X / 2) - 1,
        bg_threshold = 6;

    var scale = (getParameterByName("scale") || 5);
    function getRadius(value) {
        return Math.min(Math.round(Math.sqrt(value / Math.PI) * scale), max)
    }

    function getColor(R) {
        return "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
    }

    $.getJSON('/matrix/preload_data', function(response) {
        for (var i=0; i < response.results.length; i++) {
            var row = response.results[i];
            blocks[row._id] = row.value.count;
        }

        for (var i=0; i < 24*8; i++) {
            var current_block = start_block + i*1000*60*60;
            data.push(blocks[current_block] || 0);
        }

        for (var i = 0, ii = axisx.length; i < ii; i++) {
            r.text(leftgutter + X * (i + .5), 334, axisx[i]).attr(txt);
        }
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            r.text(10, Y * (i + .5), axisy[i]).attr(txt);
        }

        var o = 0;
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            for (var j = 0, jj = axisx.length; j < jj; j++) {
                var block_ts = start_block + o*1000*60*60;
                var R = data[o] && getRadius(data[o]);
                if (R) {
                    draw_dot(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R, data[o], block_ts);
                }
                o++;
            }
        }
    });

    function calculate_i_j_from_ts(ts) {
        ts.setUTCMinutes(0, 0, 0);
        var o = 0;
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            for (var j = 0, jj = axisx.length; j < jj; j++) {
                var block_ts = start_block + o*1000*60*60;
                if (block_ts == ts.getTime()) {
                    return {i: i, j: j};
                }
                o++;
            }
        }
    }

    function draw_dot(dx, dy, R, value, block_ts) {
        var color = getColor(R);
        colors[block_ts] = color;
        var dt = r.circle(dx + 60 + R, dy + 10, 0).attr({stroke: "none", fill: color}).animate({r: R}, Math.random()*6000, "bounce");
        dts[block_ts] = dt;
        if (R < bg_threshold) {
            var bg = r.circle(dx + 60 + R, dy + 10, 6).attr({stroke: "none", fill: "#000", opacity: .4}).hide();
            bgs[block_ts] = bg;
        }
        var lbl = r.text(dx + 60 + R, dy + 10, value)
                .attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#FFFFFF"}).hide();
        lbls[block_ts] = lbl;
        var dot = r.circle(dx + 60 + R, dy + 10, max).attr({stroke: "none", fill: "#000", opacity: 0});
        dots[block_ts] = dot;

        dot[0].onmouseover = function () {
            var bg = bgs[block_ts];
            var color = colors[block_ts];
            if (bg) {
                bg.show();
            } else {
                var clr = Raphael.rgb2hsb(color);
                clr.b = .5;
                dt.attr("fill", Raphael.hsb2rgb(clr).hex);
            }
            lbl.show();
        };
        dot[0].onmouseout = function () {
            var bg = bgs[block_ts];
            var color = colors[block_ts];
            if (bg) {
                bg.hide();
            } else {
                dt.attr("fill", color);
            }
            lbl.hide();
        };

        return dot;
    }

    window.matrix = new Matrix();
    window.matrix.join();
    function Matrix() {
        var _self = this;

	this.socket_ok = function() {
	    $('#matrix-status').html("Connected");
	    $('#matrix-status').css("border", "1px solid black");
	    $('#matrix-status').css("color", "black");
	}

	this.socket_error = function() {
	    $('#matrix-status').html("Disconnected");
	    $('#matrix-status').css("border", "1px solid red");
	    $('#matrix-status').css("color", "red");
	}

        this.join = function() {
	    var monocle_socket = io.connect('http://trisse.com:8000/monocle_meta');
	    monocle_socket.on('connect', this.socket_ok);
	    monocle_socket.on('reconnect', this.socket_ok);
	    monocle_socket.on('disconnect', this.socket_error);
	    monocle_socket.on('connect_failed', this.socket_error);
	    monocle_socket.on('reconnect_failed', this.socket_error);
	    monocle_socket.on('analytic', this.receive);
        };

        this.receive = function(data) {
            var ts = data.ts;

            ts = new Date(ts);
            ts.setUTCMinutes(0, 0, 0);

            var value = blocks[ts.getTime()];
            if (typeof value == "undefined" || !value) {
                var obj = calculate_i_j_from_ts(ts);
                var i = obj.i;
                var j = obj.j;
                var R = getRadius(1);
                blocks[ts.getTime()] = 1;
                var dot = draw_dot(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R, 1, ts.getTime());
                dot[0].onmouseover();
                timeouts[ts.getTime()] = setTimeout(dot[0].onmouseout, 5000);
            }
            else {
                value++;
                blocks[ts.getTime()] = value;
                var dt = dts[ts.getTime()];
                var radius = getRadius(value);
                var color = getColor(radius);
                if (radius >= bg_threshold) {
                    var bg = bgs[ts.getTime()];
                    if (typeof bg != "undefined" && bg) {
                        bg.hide();
                    }
                    bgs[ts.getTime()] = null;
                }
                colors[ts.getTime()] = color;
                dt.attr({fill: color});
                dt.animate({r: radius}, 500, "backOut");
                var lbl = lbls[ts.getTime()];
                lbl.attr({text: value});
                var dot = dots[ts.getTime()];
                dot[0].onmouseover();
                if (typeof timeouts[ts.getTime()] != "undefined") {
                    clearTimeout(timeouts[ts.getTime()]);
                }
                timeouts[ts.getTime()] = setTimeout(dot[0].onmouseout, 5000);
            }
        };
    }
});
