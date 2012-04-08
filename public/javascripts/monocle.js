(function($) {
    $(document).ready(function() {
        window.messages = [];
        window.timeouts = [];
        window.monocle = new Monocle();

        if (typeof local_messages != "undefined") {
            for (var i = 0; i < local_messages.length; i++) {
                window.monocle.receive(local_messages[i]);
            }
        }

        window.monocle.join();
    });

    function Monocle() {
        var _self = this;

	this.socket_ok = function() {
	    $('#monocle-status').html("Connected");
	    $('#monocle-status').css("border", "1px solid black");
	    $('#monocle-status').css("color", "black");
	}

	this.socket_error = function() {
	    $('#monocle-status').html("Disconnected");
	    $('#monocle-status').css("border", "1px solid red");
	    $('#monocle-status').css("color", "red");
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
            window.messages.push(data);

            var sessionId = data.s;
            var eventId = data.d.e;
            if (typeof eventId != "undefined" && eventId) {
                var event = events[eventId];
            }
            var href = data.d.h;
            var ts = data.ts;

            var block = $('#' + sessionId);
            if (block.length == 0) {
                var messages = $('#messages');
                block = $('<div id="' + sessionId + '" class="block"></div>');
                if (typeof sessions[sessionId] == "undefined") {
                    var display = sessionId;
                }
                else {
                    var display = sessions[sessionId];
                }
                var trailhead = $('<div class="trailhead"><span>' + display + '</span></div>');
                block.append(trailhead);
                messages.append(block);
            }
            if (block.is(":hidden")) {
                block.show('slow');
            }

            var color = '#FFFFFF';
            var style = '';
            if (typeof event != "undefined" && event) {
                var heat = event.heat;
                if (typeof heat != "undefined" && heat) {
                    if (heat >= 75) {
                        var color = "#FF0000";
                    }
                    else if (heat >= 50) {
                        var color = "#FF8000";
                    }
                    else if (heat >= 25) {
                        var color = "#FFFF00";
                    }
                    else {
                        var color = "#FFFFFF";
                    }

                    var style = ' style="background-color: ' + color + '"';
                }
            }

            var trail = $('<div class="trail"' + style + '>&nbsp;</div>');
            var tip = $('<div class="tooltip"><span>href: ' + href + '</span><br /><span>ts: ' + new Date(ts) + '</span></div>');
            block.append(trail);
            block.append(tip);
            trail.tooltip();
            trail.css("background-color", "#000000").animate({ backgroundColor: color}, 500);

            if (typeof window.timeouts[sessionId] != "undefined") {
                clearTimeout(window.timeouts[sessionId]);
            }
            window.timeouts[sessionId] = setTimeout(function() {block.hide('slow')}, 1000 * 60 * 10);
        };
    }
})(jQuery);
