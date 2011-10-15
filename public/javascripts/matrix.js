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
    var data = [],
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

    $.getJSON('/matrix/preload_data', function(response) {
        var blocks = [];
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
        for (var i = 0, ii = axisx.length; i < ii; i++) {
            r.text(leftgutter + X * (i + .5), 334, axisx[i]).attr(txt);
        }
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            r.text(10, Y * (i + .5), axisy[i]).attr(txt);
        }
        var scale = (getParameterByName("scale") || 5);
        var o = 0;
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            for (var j = 0, jj = axisx.length; j < jj; j++) {
                var R = data[o] && Math.min(Math.round(Math.sqrt(data[o] / Math.PI) * scale), max);
                if (R) {
                    (function (dx, dy, R, value) {
                        var color = "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
                        var dt = r.circle(dx + 60 + R, dy + 10, 0).attr({stroke: "none", fill: color}).animate({r: R}, Math.random()*6000, "bounce");
                        if (R < 6) {
                            var bg = r.circle(dx + 60 + R, dy + 10, 6).attr({stroke: "none", fill: "#000", opacity: .4}).hide();
                        }
                        var lbl = r.text(dx + 60 + R, dy + 10, data[o])
                                .attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#FFFFFF"}).hide();
                        var dot = r.circle(dx + 60 + R, dy + 10, max).attr({stroke: "none", fill: "#000", opacity: 0});
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
                    })(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R, data[o]);
                }
                o++;
            }
        }
    });

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

            alert(ts);
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
