(function($) {
    $(document).ready(function() {
        window.messages = [];
        window.timeouts = [];
        window.monocle = new Monocle();

        if (typeof local_messages != "undefined") {
            for (var i = 0; i < local_messages.length; i++) {
                window.monocle.receive({data: local_messages[i]});
            }
        }

        window.monocle.join();
    });

    function Monocle() {
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
            window.messages.push(message);

            var sessionId = message.data.s;
            var eventId = message.data.d.e;
            if (typeof eventId != "undefined" && eventId) {
                var event = events[eventId];
            }
            var href = message.data.d.h;
            var ts = message.data.ts;

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
                $('#monocle-status').html("Connected");
                $('#monocle-status').css("border", "1px solid black");
                $('#monocle-status').css("color", "black");
            } else {
                $('#monocle-status').html("Disconnected");
                $('#monocle-status').css("border", "1px solid red");
                $('#monocle-status').css("color", "red");
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
})(jQuery);
