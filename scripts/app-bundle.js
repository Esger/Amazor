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
        }

        App.prototype.activate = function activate() {
            var self = this;
            var $body = (0, _jquery2.default)('body');

            document.addEventListener('keydown', self.handleKeyInput, true);
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
            this.gamePosition = {};
            this.scale = 1;
            this.scale = 1;
            this.ea.subscribe('scaleChange', function (response) {
                _this.scale = response > 1 ? 1 : response;
            });
            this.ea.subscribe('centerChange', function (response) {
                _this.moveMaze(response);
            });
            this.ea.subscribe('restart', function (response) {
                _this.resetBoard();
            });
        }

        BoardCustomElement.prototype.handleTouch = function handleTouch(event) {
            var boardSize = $(this.board).height();
            var clickX = event.layerX;
            var clickY = event.layerY;
            var direction = 'undefined';
            if (clickY <= clickX) {
                if (clickY <= boardSize - clickX) {
                    direction = 'up';
                } else {
                    direction = 'right';
                }
            } else {
                if (clickY <= boardSize - clickX) {
                    direction = 'left';
                } else {
                    direction = 'down';
                }
            }
            this.ea.publish('keyPressed', direction);
            console.log(direction);
        };

        BoardCustomElement.prototype.moveMaze = function moveMaze(panbox) {
            var boardSize = 80;
            var mazeSize = 128 * this.scale;
            var minGamePosition = 0;
            var maxGamePosition = boardSize - mazeSize;

            var boardCenter = 6.25 * 6.4;
            var moveX = boardCenter - panbox.centerX * this.scale * 6.4;
            var moveY = boardCenter - panbox.centerY * this.scale * 6.4;
            this.gamePosition.x = Math.max(Math.min(moveX, minGamePosition), maxGamePosition);
            this.gamePosition.y = Math.max(Math.min(moveY, minGamePosition), maxGamePosition);
            console.log(panbox);
        };

        BoardCustomElement.prototype.resetBoard = function resetBoard() {
            this.gamePosition = {
                x: -3,
                y: -3
            };
            this.scale = 1;
        };

        BoardCustomElement.prototype.attached = function attached() {
            this.resetBoard();
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
            this.ea.subscribe('restart', function (response) {
                _this.makeNewMaze();
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

        MazeCustomElement.prototype.makeNewMaze = function makeNewMaze() {
            this.cells = this.newMaze(this.width, this.height);
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
            this.makeNewMaze();
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
                console.log(response);
                if (_this.areTogether()) {
                    _this.ea.publish('allTogether');
                }
                if (response.player.name == 'white') {
                    _this.adjustScale();
                }
            });
            this.ea.subscribe('restart', function (response) {
                _this.resetPlayers();
            });

            this.players = [];
        }

        PlayersCustomElement.prototype.resetPlayers = function resetPlayers() {
            this.players = [{
                name: 'black',
                step: false,
                x: 5,
                y: 5
            }, {
                name: 'white',
                step: false,
                x: 13,
                y: 13
            }];
            this.adjustScale();
        };

        PlayersCustomElement.prototype.stepClass = function stepClass(player) {
            var stepClass = player.step ? 'step ' : 'nostep ';
            return stepClass + player.name;
        };

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
            var panBoxPadding = 3;
            var panBox = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width: 0,
                height: 0,
                centerX: 0,
                centerY: 0,
                size: 0
            };
            panBox.top = Math.max(minY - panBoxPadding, 0);
            panBox.right = Math.min(maxX + panBoxPadding + 1, 20);
            panBox.bottom = Math.min(maxY + panBoxPadding + 1, 20);
            panBox.left = Math.max(minX - panBoxPadding, 0);

            panBox.width = panBox.right - panBox.left;
            panBox.height = panBox.bottom - panBox.top;

            panBox.size = Math.max(panBox.width, panBox.height);
            var scale = Math.min(12.5 / panBox.size, 1);

            panBox.centerX = (panBox.right + panBox.left) / 2;
            panBox.centerY = (panBox.bottom + panBox.top) / 2;


            this.ea.publish('scaleChange', scale);
            this.ea.publish('centerChange', panBox);
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
            console.log(response);
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
                    self.players[0].step = !response.player.step;
                } else {
                    self.players[1].x += xy[0];
                    self.players[1].y += xy[1];
                    self.players[1].step = !response.player.step;
                }
            };
            if (directions.hasOwnProperty(response.direction)) {
                move(directions[response.direction]);
            }
        };

        PlayersCustomElement.prototype.attached = function attached() {
            this.resetPlayers();
            this.adjustScale();
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

        WinCustomElement.prototype.restart = function restart() {
            this.ea.publish('restart');
            this.showWin = false;
        };

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
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/board\"></require>\n    <h1>Join the pawns</h1>\n    <board></board>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "* {\n    margin : 0;\n    border : 0;\n    padding: 0;\n}\n\nbody, html {\n    height          : 100vh;\n    width           : 100vw;\n    overflow        : hidden;\n    display         : flex;\n    flex-direction  : column;\n    align-items     : center;\n    justify-content : center;\n    background-color: #E3B32D;\n}\n\nbody {\n    -webkit-overflow-scrolling: touch;\n}\n\nh1 {\n    font-family   : \"Cabin Sketch\", sans-serif;\n    font-size     : 10vmin;\n    font-style    : normal;\n    font-variant  : small-caps;\n    line-height   : 1;\n    text-align    : center;\n    color         : whitesmoke;\n    text-transform: uppercase;\n    letter-spacing: 2px;\n    color         : #fff;\n}\n\na {\n    outline: none;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template ref=\"board\"\n          touchstart.delegate=\"handleTouch($event)\">\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/maze\"></require>\n    <require from=\"components/players\"></require>\n    <require from=\"components/win\"></require>\n    <gameContainer css=\"transform: translate3d(${gamePosition.x}vmin, ${gamePosition.y}vmin, 0) scale(${scale})\">\n        <maze></maze>\n        <players></players>\n    </gameContainer>\n    <win></win>\n\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\na, abbr, acronym, address, applet, article, aside, audio, b, big, blockquote, body, canvas, caption, center, cite, code, dd, del, details, dfn, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, html, i, iframe, img, ins, kbd, label, legend, li, mark, menu, nav, object, ol, output, p, pre, q, ruby, s, samp, section, small, span, strike, strong, sub, summary, sup, table, tbody, td, tfoot, th, thead, time, tr, tt, u, ul, var, video {\n    margin        : 0;\n    padding       : 0;\n    border        : 0;\n    font-size     : 100%;\n    font          : inherit;\n    vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {\n    display: block;\n}\n\nbody {\n    line-height: 1;\n}\n\nol, ul {\n    list-style: none;\n}\n\nblockquote, q {\n    quotes: none;\n}\n\nblockquote:after, blockquote:before, q:after, q:before {\n    content: '';\n    content: none;\n}\n\ntable {\n    border-collapse: collapse;\n    border-spacing : 0;\n}\n"; });
define('text!components/maze.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/maze.css\"></require>\n    <div class=\"row\"\n         repeat.for=\"row of cells\">\n        <div class=\"cell\"\n             class.bind=\"wallClass(cell)\"\n             repeat.for=\"cell of row\">\n        </div>\n    </div>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = "board {\n    position          : relative;\n    width             : 80vmin;\n    height            : 80vmin;\n    margin            : 1vmin;\n    overflow          : hidden;\n    -webkit-box-shadow: inset 0 0 10px 0 rgba(0,0,0,.9);\n    box-shadow        : inset 0 0 10px 0 rgba(0,0,0,.9);\n    background-color  : rgba(255,255,255,0.5);\n    border            : 3vmin solid rgba(0,0,0,0);\n}\n\ngameContainer {\n    width           : 128vmin;\n    height          : 128vmin;\n    box-sizing      : border-box;\n    position        : absolute;\n    left            : 0;\n    top             : 0;\n    transform-origin: 0 0 0;\n    transition      : transform 2s ease-in-out;\n    transition-delay: 100;\n    border          : 2px solid #333;\n}\n"; });
define('text!components/players.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/players.css\"></require>\n    <player repeat.for=\"player of players\"\n            class=\"${stepClass(player)}\"\n            css=\"transform: translate3d(${player.x*6.4}vmin, ${player.y*6.4}vmin, 0)\">${player.step}</player>\n</template>"; });
define('text!components/win.html', ['module'], function(module) { module.exports = "<template class=\"${showWin ? 'show' : ''}\">\n    <require from=\"components/win.css\"></require>\n    <h2>Yo!<br>you<br>did it!<br>\n        <a href=\"javascript:void(0);\"\n           click.delegate=\"restart()\"\n           touchstart.delegate=\"restart()\">Again?</a>\n    </h2>\n</template>"; });
define('text!components/maze.css', ['module'], function(module) { module.exports = "maze {\n    width         : 100%;\n    height        : 100%;\n    position      : absolute;\n    top           : 0;\n    display       : flex;\n    flex-direction: column;\n}\n\n.row {\n    display       : flex;\n    flex-direction: row;\n    flex          : 1 0 auto;\n}\n\n.cell {\n    flex    : 1 0 auto;\n    position: relative;\n    border  : 4px dashed rgba(96,52,24,0.7);\n    margin  : -2px;\n}\n\n.cell::before {\n    content     : '';\n    position    : absolute;\n    top         : -4px;\n    left        : -4px;\n    z-index     : -1;\n    width       : 100%;\n    height      : 100%;\n    border      : 4px solid transparent;\n    opacity     : .4;\n    border-color: inherit;\n}\n\n.wall0000 {\n    border-color: transparent transparent transparent transparent;\n}\n\n.wall0001 {\n    border-color: transparent transparent transparent rgba(96,52,24,0.7);\n}\n\n.wall0010 {\n    border-color: transparent transparent rgba(96,52,24,0.7) transparent;\n}\n\n.wall0011 {\n    border-color: transparent transparent rgba(96,52,24,0.7) rgba(96,52,24,0.7);\n}\n\n.wall0100 {\n    border-color: transparent rgba(96,52,24,0.7) transparent transparent;\n}\n\n.wall0101 {\n    border-color: transparent rgba(96,52,24,0.7) transparent rgba(96,52,24,0.7);\n}\n\n.wall0110 {\n    border-color: transparent rgba(96,52,24,0.7) rgba(96,52,24,0.7) transparent;\n}\n\n.wall0111 {\n    border-color: transparent rgba(96,52,24,0.7) rgba(96,52,24,0.7) rgba(96,52,24,0.7);\n}\n\n.wall1000 {\n    border-color: rgba(96,52,24,0.7) transparent transparent transparent;\n}\n\n.wall1001 {\n    border-color: rgba(96,52,24,0.7) transparent transparent rgba(96,52,24,0.7);\n}\n\n.wall1010 {\n    border-color: rgba(96,52,24,0.7) transparent rgba(96,52,24,0.7) transparent;\n}\n\n.wall1011 {\n    border-color: rgba(96,52,24,0.7) transparent rgba(96,52,24,0.7) rgba(96,52,24,0.7);\n}\n\n.wall1100 {\n    border-color: rgba(96,52,24,0.7) rgba(96,52,24,0.7) transparent transparent;\n}\n\n.wall1101 {\n    border-color: rgba(96,52,24,0.7) rgba(96,52,24,0.7) transparent rgba(96,52,24,0.7);\n}\n\n.wall1110 {\n    border-color: rgba(96,52,24,0.7) rgba(96,52,24,0.7) rgba(96,52,24,0.7) transparent;\n}\n\n.wall1111 {\n    border-color: rgba(96,52,24,0.7) rgba(96,52,24,0.7) rgba(96,52,24,0.7) rgba(96,52,24,0.7);\n}\n"; });
define('text!components/players.css', ['module'], function(module) { module.exports = "players {\n    display : block;\n    position: relative;\n    top     : 0;\n    width   : 100%;\n    height  : 100%;\n}\n\nplayer {\n    position         : absolute;\n    left             : .25vmin;\n    top              : .25vmin;\n    width            : 5.5vmin;\n    height           : 5.5vmin;\n    border-radius    : 3vmin;\n    box-sizing       : border-box;\n    transition       : transform .2s ease-in-out;\n    background-image : url(\"../img/poppetjes.png\");\n    background-repeat: no-repeat;\n    background-size  : 200%;\n}\n\nplayer.black {\n    background-position: 0 0;\n}\n\nplayer.black.step {\n    background-position: 100% 0;\n}\n\nplayer.white {\n    background-position: 0 100%;\n}\n\nplayer.white.step {\n    background-position: 100% 100%;\n}\n"; });
define('text!components/win.css', ['module'], function(module) { module.exports = "win {\n    display                    : flex;\n    justify-content            : center;\n    align-items                : center;\n    height                     : 100%;\n    background-color           : rgba(0, 0, 0, .8);\n    opacity                    : 0;\n    transition                 : opacity .5s ease-out;\n    -webkit-transform          : translateZ(0);\n    -webkit-perspective        : 1000;\n    -webkit-backface-visibility: hidden;\n}\n\nwin h2 {\n    font-family                : \"Cabin Sketch\", sans-serif;\n    font-size                  : 15vmin;\n    font-style                 : normal;\n    font-variant               : small-caps;\n    line-height                : 10vmin;\n    text-align                 : center;\n    color                      : whitesmoke;\n    padding-top                : 5vmin;\n    transform                  : scale(0.0001);\n    transition                 : transform .5s ease-out;\n    -webkit-transform          : translateZ(0);\n    -webkit-perspective        : 1000;\n    -webkit-backface-visibility: hidden;\n}\n\nwin h2 a {\n    font-size      : 10vmin;\n    color          : whitesmoke;\n    cursor         : pointer;\n    text-decoration: none;\n    margin-top     : 10vmin;\n    pointer-events : none;\n}\n\nwin.show {\n    opacity: 1;\n}\n\nwin.show h2 {\n    transform: scale(1);\n}\n\nwin.show h2 a {\n    pointer-events: auto;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map