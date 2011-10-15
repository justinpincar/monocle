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

    // Grab the data
    var blocks = [],
        dts = [],
        lbls = [],
        bgs = [],
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
        max = Math.round(X / 2) - 1;

    var scale = (getParameterByName("scale") || 5);
    function getRadius(value) {
        return Math.min(Math.round(Math.sqrt(value / Math.PI) * scale), max)
    }

    $.getJSON('/matrix/preload_data', function(response) {
        for (var i=0; i < response.results.length; i++) {
            var row = response.results[i];
            blocks[row._id] = row.value.count;
        }

        d.setUTCHours(0, 0, 0, 0);
        var start_block = d.getTime() - 1000*60*60*24*7;

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

    function draw_dot(dx, dy, R, value, block_ts) {
        var color = "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
        var dt = r.circle(dx + 60 + R, dy + 10, 0).attr({stroke: "none", fill: color}).animate({r: R}, Math.random()*6000, "bounce");
        dts[block_ts] = dt;
        if (R < 6) {
            var bg = r.circle(dx + 60 + R, dy + 10, 6).attr({stroke: "none", fill: "#000", opacity: .4}).hide();
            bgs[block_ts] = bg;
        }
        var lbl = r.text(dx + 60 + R, dy + 10, value)
                .attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#FFFFFF"}).hide();
        lbls[block_ts] = lbl;
        var dot = r.circle(dx + 60 + R, dy + 10, max).attr({stroke: "none", fill: "#000", opacity: 0});
        dots[block_ts] = dot;

        console.log("dots[" + block_ts + "] assigned");

        dot[0].onmouseover = function () {
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
            if (bg) {
                bg.hide();
            } else {
                dt.attr("fill", color);
            }
            lbl.hide();
        };
    }

    window.matrix = new Matrix();
    window.matrix.join();
    function Matrix() {
        var _self = this;

        this.join = function() {
            var cometdURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";

            $.cometd.websocketEnabled = true;
            $.cometd.configure({
                url: cometdURL,
                logLevel: 'debug'
            });
            $.cometd.handshake();
        };

        this.leave = function() {
            _unsubscribe();
            $.cometd.disconnect();
        };

        this.receive = function(message) {
            var ts = message.data.ts;

            ts = new Date(ts);
            ts.setUTCMinutes(0, 0, 0);

            var value = blocks[ts.getTime()];
            if (typeof value == "undefined" || !value) {

            }
            else {
                value++;
                blocks[ts.getTime()] = value;
                var dot = dots[ts.getTime()];
                dot.animate({r: getRadius(value)}, 500, "backOut");
                var lbl = lbls[ts.getTime()];
                lbl.attr({text: value});
                lbl.show('fast');
                if (typeof timeouts[ts.getTime()] != "undefined") {
                    clearTimeout(timeouts[ts.getTime()]);
                }
                timeouts[ts.getTime()] = setTimeout(function() {lbl.hide('slow')}, 5000);
            }
        };

        function _unsubscribe() {
            if (_chatSubscription) {
                $.cometd.unsubscribe(_chatSubscription);
            }
            _chatSubscription = null;
        }

        function _subscribe() {
            _chatSubscription = $.cometd.subscribe('/chat/' + channel, _self.receive);
        }

        function _connectionInitialized() {
            _subscribe();
        }

        function _connectionEstablished() {
            alert("Connection established.");
        }

        function _connectionBroken() {
            alert("Connection broken.");
        }

        function _connectionClosed() {
            alert("Connection closed.");
        }

        function _metaConnect(message) {
            if (message.successful) {
                $('#matrix-status').html("Connected");
                $('#matrix-status').css("border", "1px solid black");
                $('#matrix-status').css("color", "black");
            } else {
                $('#matrix-status').html("Disconnected");
                $('#matrix-status').css("border", "1px solid red");
                $('#matrix-status').css("color", "red");
            }

            if (_disconnecting) {
                _connected = false;
                _connectionClosed();
            }
            else {
                _wasConnected = _connected;
                _connected = message.successful === true;
                if (!_wasConnected && _connected) {
                    _connectionEstablished();
                }
                else if (_wasConnected && !_connected) {
                    _connectionBroken();
                }
            }
        }

        function _metaHandshake(message) {
            if (message.successful) {
                _connectionInitialized();
            }
        }

        $.cometd.addListener('/meta/handshake', _metaHandshake);
        $.cometd.addListener('/meta/connect', _metaConnect);

        $(window).unload(function() {
            if ($.cometd.reload) {
                $.cometd.reload();
            }
            else {
                $.cometd.disconnect();
            }
        });
    }
});