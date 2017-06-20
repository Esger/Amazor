define('app',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'jquery'], function (exports, _aureliaFramework, _aureliaEventAggregator, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function App(eventAggregator) {
            var _this = this;

            _classCallCheck(this, App);

            this.handleKeyInput = function (event) {
                var keycode = event.keyCode || event.which;
                switch (keycode) {
                    case _this.keys.left:
                        _this.ea.publish('keyPressed', "left");
                        break;
                    case _this.keys.up:
                        _this.ea.publish('keyPressed', "up");
                        break;
                    case _this.keys.right:
                        _this.ea.publish('keyPressed', "right");
                        break;
                    case _this.keys.down:
                        _this.ea.publish('keyPressed', "down");
                        break;
                    default:
                        _this.ea.publish('keyPressed', "somekey");
                }
            };

            this.ea = eventAggregator;
            this.keys = {
                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40
            };
            this.touchEvent = {
                'startX': null,
                'startY': null,
                'endX': null,
                'endY': null
            };
        }

        App.prototype.handleSwipe = function handleSwipe() {
            var thresHold = 50;
            var startX = this.touchEvent.startX;
            var startY = this.touchEvent.startY;
            var dX = this.touchEvent.endX - this.touchEvent.startX;
            var dY = this.touchEvent.endY - this.touchEvent.startY;
            var vertical = Math.abs(dX) < Math.abs(dY);
            var horizontal = Math.abs(dX) > Math.abs(dY);
            var left = dX < -thresHold && Math.abs(dY) < thresHold;
            var right = dX > thresHold && Math.abs(dY) < thresHold;
            var up = dY < -thresHold && Math.abs(dX) < thresHold;
            var down = dY > thresHold && Math.abs(dX) < thresHold;
            if (vertical) {
                if (up) {
                    this.ea.publish('keyPressed', "up");
                }
                if (down) {
                    this.ea.publish('keyPressed', "down");
                }
            }
            if (horizontal) {
                if (left) {
                    this.ea.publish('keyPressed', "left");
                }
                if (right) {
                    this.ea.publish('keyPressed', "right");
                }
            }
        };

        App.prototype.activate = function activate() {
            var self = this;
            var $body = (0, _jquery2.default)('body');

            document.addEventListener('keydown', self.handleKeyInput, true);
            $body.on('touchstart', function (event) {
                self.touchEvent.startX = event.originalEvent.touches[0].clientX;
                self.touchEvent.startY = event.originalEvent.touches[0].clientY;
            });
            $body.on('touchend', function (event) {
                self.touchEvent.endX = event.originalEvent.changedTouches[0].clientX;
                self.touchEvent.endY = event.originalEvent.changedTouches[0].clientY;
                self.handleSwipe();
            });
        };

        return App;
    }()) || _class);
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('components/board',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.BoardCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var BoardCustomElement = exports.BoardCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function BoardCustomElement(eventAggregator) {
            var _this = this;

            _classCallCheck(this, BoardCustomElement);

            this.ea = eventAggregator;
            this.gamePosition = {
                x: -40,
                y: -40
            };
            this.ea.subscribe('keyPressed', function (response) {
                var self = _this;
                var directions = {
                    'left': [1, 0],
                    'right': [-1, 0],
                    'up': [0, 1],
                    'down': [0, -1]
                };
                if (directions.hasOwnProperty(response)) {
                    self.moveMaze(directions[response]);
                }
            });
            this.scale = 1;
            this.ea.subscribe('scaleChange', function (response) {
                _this.scale = response > 1 ? 1 : response;
            });
            this.ea.subscribe('centerChange', function (response) {
                console.log(response);
                _this.gamePosition.x = -response.centerX * 4;
                _this.gamePosition.y = -response.centerY * 4;
            });
        }

        BoardCustomElement.prototype.moveMaze = function moveMaze(xy) {
            var self = this;
            this.gamePosition.x += 4 * xy[0];
            this.gamePosition.y += 4 * xy[1];
        };

        return BoardCustomElement;
    }()) || _class);
});
define('components/maze',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MazeCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var MazeCustomElement = exports.MazeCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function MazeCustomElement(eventAggregator) {
            var _this = this;

            _classCallCheck(this, MazeCustomElement);

            this.ea = eventAggregator;
            this.ea.subscribe('checkWall', function (response) {
                if (!_this.hasWall(response)) {
                    _this.ea.publish('movePlayer', response);
                }
            });
            this.cells = [];
            this.width = 20;
            this.height = 20;
        }

        MazeCustomElement.prototype.hasWall = function hasWall(response) {
            var wallPositions = {
                'left': 3,
                'right': 1,
                'up': 0,
                'down': 2
            };
            if (wallPositions.hasOwnProperty(response.direction)) {
                return this.cells[response.player.y][response.player.x][wallPositions[response.direction]] == 1;
            }
        };

        MazeCustomElement.prototype.wallClass = function wallClass(cell) {
            return 'wall' + cell.join('');
        };

        MazeCustomElement.prototype.newMaze = function newMaze(x, y) {
            var totalCells = x * y;
            var cells = new Array();
            var unvis = new Array();
            for (var i = 0; i < y; i++) {
                cells[i] = new Array();
                unvis[i] = new Array();
                for (var j = 0; j < x; j++) {
                    cells[i][j] = [1, 1, 1, 1];
                    unvis[i][j] = true;
                }
            }

            var currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
            var path = [currentCell];
            unvis[currentCell[0]][currentCell[1]] = false;
            var visited = 1;

            while (visited < totalCells) {
                var pot = [[currentCell[0] - 1, currentCell[1], 0, 2], [currentCell[0], currentCell[1] + 1, 1, 3], [currentCell[0] + 1, currentCell[1], 2, 0], [currentCell[0], currentCell[1] - 1, 3, 1]];
                var neighbors = new Array();

                for (var l = 0; l < 4; l++) {
                    if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) {
                        neighbors.push(pot[l]);
                    }
                }

                if (neighbors.length) {
                    var next = neighbors[Math.floor(Math.random() * neighbors.length)];

                    cells[currentCell[0]][currentCell[1]][next[2]] = 0;
                    cells[next[0]][next[1]][next[3]] = 0;

                    unvis[next[0]][next[1]] = false;
                    visited++;
                    currentCell = [next[0], next[1]];
                    path.push(currentCell);
                } else {
                        currentCell = path.pop();
                    }
            }
            return cells;
        };

        MazeCustomElement.prototype.attached = function attached() {
            this.cells = this.newMaze(this.width, this.height);
        };

        return MazeCustomElement;
    }()) || _class);
});
define('components/players',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PlayersCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var PlayersCustomElement = exports.PlayersCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function PlayersCustomElement(eventAggregator) {
            var _this = this;

            _classCallCheck(this, PlayersCustomElement);

            this.ea = eventAggregator;
            this.ea.subscribe('keyPressed', function (response) {
                for (var i = 0; i < _this.players.length; i++) {
                    _this.ea.publish('checkWall', { direction: response, player: _this.players[i] });
                }
            });
            this.ea.subscribe('movePlayer', function (response) {
                _this.movePlayer(response);
                _this.adjustScale();
                if (_this.areTogether()) {
                    _this.ea.publish('allTogether');
                }
            });

            this.players = [{
                name: 'black',
                x: 5,
                y: 5
            }, {
                name: 'white',
                x: 14,
                y: 14
            }];
        }

        PlayersCustomElement.prototype.adjustScale = function adjustScale() {
            var minX = Math.min.apply(Math, this.players.map(function (o) {
                return o.x;
            }));
            var maxX = Math.max.apply(Math, this.players.map(function (o) {
                return o.x;
            }));
            var minY = Math.min.apply(Math, this.players.map(function (o) {
                return o.y;
            }));
            var maxY = Math.max.apply(Math, this.players.map(function (o) {
                return o.y;
            }));
            var dX = maxX - minX;
            var centerX = Math.ceil((maxX + minX) / 2);
            var centerY = Math.ceil((maxY + minY) / 2);
            var dY = maxY - minY;
            var dMax = Math.max(dX, dY);
            var scale = 9 / dMax;
            this.ea.publish('scaleChange', scale);
            this.ea.publish('centerChange', { 'centerX': centerX, 'centerY': centerY });
        };

        PlayersCustomElement.prototype.areTogether = function areTogether() {
            var firstPlayer = this.players[0];
            for (var i = 1; i < this.players.length; i++) {
                if (this.players[i].x !== firstPlayer.x) {
                    return false;
                }
                if (this.players[i].y !== firstPlayer.y) {
                    return false;
                }
            }
            return true;
        };

        PlayersCustomElement.prototype.movePlayer = function movePlayer(response) {
            var self = this;
            var directions = {
                'left': [-1, 0],
                'right': [+1, 0],
                'up': [0, -1],
                'down': [0, +1]
            };
            var move = function move(xy) {
                if (response.player.name == 'black') {
                    self.players[0].x += xy[0];
                    self.players[0].y += xy[1];
                } else {
                    self.players[1].x += xy[0];
                    self.players[1].y += xy[1];
                }
            };
            if (directions.hasOwnProperty(response.direction)) {
                move(directions[response.direction]);
            }
        };

        return PlayersCustomElement;
    }()) || _class);
});
define('components/win',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.WinCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var WinCustomElement = exports.WinCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function WinCustomElement(eventAggregator) {
            var _this = this;

            _classCallCheck(this, WinCustomElement);

            this.ea = eventAggregator;
            this.showWin = false;
            this.ea.subscribe('allTogether', function (response) {
                _this.showWin = true;
                console.log(_this.showWin);
            });
        }

        WinCustomElement.prototype.attached = function attached() {};

        return WinCustomElement;
    }()) || _class);
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('resources/binding-behaviors/keystrokes',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Keystrokes = exports.Keystrokes = function () {
        function Keystrokes() {
            _classCallCheck(this, Keystrokes);

            this.myKeypressCallback = this.keypressInput.bind(this);
        }

        Keystrokes.prototype.activate = function activate() {
            window.addEventListener('keypress', this.myKeypressCallback, false);
        };

        Keystrokes.prototype.deactivate = function deactivate() {
            window.removeEventListener('keypress', this.myKeypressCallback);
        };

        Keystrokes.prototype.keypressInput = function keypressInput(e) {
            console.log(e);
        };

        return Keystrokes;
    }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/board\"></require>\n    <h1>Join the pawns!</h1>\n    <board></board>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "* {\n    margin : 0;\n    border : 0;\n    padding: 0;\n}\n\nbody, html {\n    position        : fixed;\n    height          : 100vh;\n    width           : 100vw;\n    overflow        : hidden;\n    display         : flex;\n    flex-direction  : column;\n    align-items     : center;\n    justify-content : center;\n    background-color: #E3B32D;\n}\n\nbody {\n    -webkit-overflow-scrolling: touch;\n}\n\nh1 {\n    font-family   : \"Cabin Sketch\", sans-serif;\n    font-size     : 7vmin;\n    font-style    : normal;\n    font-variant  : small-caps;\n    line-height   : 1;\n    text-align    : center;\n    color         : whitesmoke;\n    text-transform: uppercase;\n    letter-spacing: 2px;\n    color         : #fff;\n}\n\na {\n    outline: none;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/maze\"></require>\n    <require from=\"components/players\"></require>\n    <require from=\"components/win\"></require>\n    <gameContainer css=\"transform: translate(${gamePosition.x}vmin, ${gamePosition.y}vmin) scale(${scale})\">\n        <maze></maze>\n        <players></players>\n    </gameContainer>\n    <win></win>\n\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\na, abbr, acronym, address, applet, article, aside, audio, b, big, blockquote, body, canvas, caption, center, cite, code, dd, del, details, dfn, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, html, i, iframe, img, ins, kbd, label, legend, li, mark, menu, nav, object, ol, output, p, pre, q, ruby, s, samp, section, small, span, strike, strong, sub, summary, sup, table, tbody, td, tfoot, th, thead, time, tr, tt, u, ul, var, video {\n    margin        : 0;\n    padding       : 0;\n    border        : 0;\n    font-size     : 100%;\n    font          : inherit;\n    vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {\n    display: block;\n}\n\nbody {\n    line-height: 1;\n}\n\nol, ul {\n    list-style: none;\n}\n\nblockquote, q {\n    quotes: none;\n}\n\nblockquote:after, blockquote:before, q:after, q:before {\n    content: '';\n    content: none;\n}\n\ntable {\n    border-collapse: collapse;\n    border-spacing : 0;\n}\n"; });
define('text!components/maze.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/maze.css\"></require>\n    <div class=\"row\"\n         repeat.for=\"row of cells\">\n        <div class=\"cell\"\n             class.bind=\"wallClass(cell)\"\n             repeat.for=\"cell of row\">\n        </div>\n    </div>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = "board {\n    position          : relative;\n    width             : 50vmin;\n    height            : 50vmin;\n    max-height        : 90vmin;\n    max-width         : 90vmin;\n    margin            : 2vmin;\n    overflow          : hidden;\n    -webkit-box-shadow: inset 0 0 10px 0 rgba(0,0,0,.9);\n    box-shadow        : inset 0 0 10px 0 rgba(0,0,0,.9);\n    background-color  : rgba(255,255,255,0.5);\n    border            : 3vmin solid rgba(0,0,0,0);\n}\n\ngameContainer {\n    width     : 80vmin;\n    height    : 80vmin;\n    position  : absolute;\n    left      : 50%;\n    top       : 50%;\n    transition: all 2s;\n    border    : 2px solid #333;\n}\n"; });
define('text!components/players.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/players.css\"></require>\n    <player repeat.for=\"player of players\"\n            class.bind=\"player.name\"\n            css=\"transform: translate(${player.x*4}vmin, ${player.y*4}vmin)\"></player>\n</template>"; });
define('text!components/maze.css', ['module'], function(module) { module.exports = "maze {\n    width         : 100%;\n    height        : 100%;\n    position      : absolute;\n    top           : 0;\n    display       : flex;\n    flex-direction: column;\n}\n\n.row {\n    display       : flex;\n    flex-direction: row;\n    flex          : 1 0 auto;\n}\n\n.cell {\n    flex  : 1 0 auto;\n    border: 2px solid rgba(0,0,0,0.7);\n    margin: -1px;\n}\n\n.wall0000 {\n    border-color: transparent transparent transparent transparent;\n}\n\n.wall0001 {\n    border-color: transparent transparent transparent rgba(0,0,0,0.7);\n}\n\n.wall0010 {\n    border-color: transparent transparent rgba(0,0,0,0.7) transparent;\n}\n\n.wall0011 {\n    border-color: transparent transparent rgba(0,0,0,0.7) rgba(0,0,0,0.7);\n}\n\n.wall0100 {\n    border-color: transparent rgba(0,0,0,0.7) transparent transparent;\n}\n\n.wall0101 {\n    border-color: transparent rgba(0,0,0,0.7) transparent rgba(0,0,0,0.7);\n}\n\n.wall0110 {\n    border-color: transparent rgba(0,0,0,0.7) rgba(0,0,0,0.7) transparent;\n}\n\n.wall0111 {\n    border-color: transparent rgba(0,0,0,0.7) rgba(0,0,0,0.7) rgba(0,0,0,0.7);\n}\n\n.wall1000 {\n    border-color: rgba(0,0,0,0.7) transparent transparent transparent;\n}\n\n.wall1001 {\n    border-color: rgba(0,0,0,0.7) transparent transparent rgba(0,0,0,0.7);\n}\n\n.wall1010 {\n    border-color: rgba(0,0,0,0.7) transparent rgba(0,0,0,0.7) transparent;\n}\n\n.wall1011 {\n    border-color: rgba(0,0,0,0.7) transparent rgba(0,0,0,0.7) rgba(0,0,0,0.7);\n}\n\n.wall1100 {\n    border-color: rgba(0,0,0,0.7) rgba(0,0,0,0.7) transparent transparent;\n}\n\n.wall1101 {\n    border-color: rgba(0,0,0,0.7) rgba(0,0,0,0.7) transparent rgba(0,0,0,0.7);\n}\n\n.wall1110 {\n    border-color: rgba(0,0,0,0.7) rgba(0,0,0,0.7) rgba(0,0,0,0.7) transparent;\n}\n\n.wall1111 {\n    border-color: rgba(0,0,0,0.7) rgba(0,0,0,0.7) rgba(0,0,0,0.7) rgba(0,0,0,0.7);\n}\n"; });
define('text!components/win.html', ['module'], function(module) { module.exports = "<template class=\"${showWin ? 'show' : ''}\">\n    <require from=\"components/win.css\"></require>\n    <h2>Yo!<br>you<br>did it!</h2>\n</template>"; });
define('text!components/players.css', ['module'], function(module) { module.exports = "players {\n    display   : block;\n    position  : relative;\n    top       : 0;\n    width     : 100%;\n    height    : 100%;\n    transition: all .5s;\n}\n\nplayer {\n    position     : absolute;\n    left         : .3vmin;\n    top          : .3vmin;\n    width        : 3.5vmin;\n    height       : 3.5vmin;\n    border-radius: 25px;\n    transition   : all .2s;\n    box-sizing   : border-box;\n\n}\n\nplayer.black {\n    background-color: darkgreen;\n    box-shadow      : 0 0 7px 0 rgba(0, 0, 0, 1), inset 0 0 15px 0 rgba(0, 0, 0, 0.5);\n}\n\nplayer.white {\n    background-color: crimson;\n    box-shadow      : 0 0 7px 0 rgba(0, 0, 0, 1), inset 0 0 15px 0 rgba(0,0,0, 0.7);\n}\n"; });
define('text!components/win.css', ['module'], function(module) { module.exports = "win {\n    display         : flex;\n    justify-content : center;\n    align-items     : center;\n    height          : 100%;\n    background-color: rgba(0, 0, 0, .8);\n    opacity         : 0;\n    transition      : all .5s ease-out;\n}\n\nwin h2 {\n    font-family : \"Cabin Sketch\";\n    font-size   : 17vmin;\n    font-style  : normal;\n    font-variant: small-caps;\n    line-height : 12vmin;\n    text-align  : center;\n    color       : whitesmoke;\n    transform   : scale(0.0001);\n    transition  : all .5s ease-out;\n}\n\nwin.show {\n    opacity: 1;\n}\n\nwin.show h2 {\n    transform: scale(1);\n}\n"; });
//# sourceMappingURL=app-bundle.js.map