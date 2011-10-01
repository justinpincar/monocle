(function($) {
    $(document).ready(function() {
        window.monocle = new Monocle();
        window.monocle.join();

        window.messages = [];
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

            var userId = message.data.u;
            var href = message.data.d.h;
            var ts = message.data.ts;

            var block = $('#' + userId);
            if (block.length == 0) {
            var messages = $('#messages');
            block = $('<div id="' + userId + '" class="block"></div>');
            var trailhead = $('<div class="trailhead"><span>' + userId + '</span></div>');
            block.append(trailhead);
            messages.append(block);
            }
            var trail = $('<div class="trail">&nbsp;</div>');
            var tip = $('<div class="tooltip"><span>href: ' + href + '</span><br /><span>ts: ' + new Date(ts) + '</span></div>');
            block.append(trail);
            block.append(tip);
            trail.tooltip();
            trail.css("background-color", "#000000").animate({ backgroundColor: "#FFFFFF"}, 500);
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