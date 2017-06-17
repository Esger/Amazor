define('app',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function App(eventAggregator) {
        var _this = this;

        _classCallCheck(this, App);

        this.handleKeyInput = function (event) {
            var keycode = event.keyCode || event.which;
            if (_this.listen2keys) {
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
            }
        };

        this.keys = {
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40
        };
    }) || _class);
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

    var BoardCustomElement = exports.BoardCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function BoardCustomElement(eventAggregator) {
        _classCallCheck(this, BoardCustomElement);
    }) || _class);
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

            this.cells = [];
            this.width = 20;
            this.height = 20;
            this.ea = eventAggregator;
            this.ea.subscribe('keyPressed', function (response) {
                _this.move(response);
            });
        }

        MazeCustomElement.prototype.move = function move(direction) {
            switch (direction) {
                case 'left':
                    this.step(-1, 0);
                    break;
                case 'right':
                    this.step(1, 0);
                    break;
                case 'up':
                    this.step(0, -1);
                    break;
                case 'down':
                    this.step(0, 1);
                    break;
                default:
            }
        };

        MazeCustomElement.prototype.step = function step(x, y) {
            console.log({ x: x, y: y });
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
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"reset.css\"></require>\n    <require from=\"app.css\"></require>\n    <require from=\"components/board\"></require>\n    <h1>This is amazing!</h1>\n    <board></board>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "* {\n    margin : 0;\n    border : 0;\n    padding: 0;\n}\n\nbody, html {\n    position        : fixed;\n    height          : 100vh;\n    width           : 100vw;\n    overflow        : hidden;\n    display         : flex;\n    flex-direction  : column;\n    align-items     : center;\n    justify-content : center;\n    background-color: #E3B32D;\n}\n\nbody {\n    -webkit-overflow-scrolling: touch;\n}\n\na {\n    outline: none;\n}\n"; });
define('text!components/board.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/board.css\"></require>\n    <require from=\"components/maze\"></require>\n    <maze></maze>\n</template>"; });
define('text!reset.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\na, abbr, acronym, address, applet, article, aside, audio, b, big, blockquote, body, canvas, caption, center, cite, code, dd, del, details, dfn, div, dl, dt, em, embed, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, html, i, iframe, img, ins, kbd, label, legend, li, mark, menu, nav, object, ol, output, p, pre, q, ruby, s, samp, section, small, span, strike, strong, sub, summary, sup, table, tbody, td, tfoot, th, thead, time, tr, tt, u, ul, var, video {\n    margin        : 0;\n    padding       : 0;\n    border        : 0;\n    font-size     : 100%;\n    font          : inherit;\n    vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {\n    display: block;\n}\n\nbody {\n    line-height: 1;\n}\n\nol, ul {\n    list-style: none;\n}\n\nblockquote, q {\n    quotes: none;\n}\n\nblockquote:after, blockquote:before, q:after, q:before {\n    content: '';\n    content: none;\n}\n\ntable {\n    border-collapse: collapse;\n    border-spacing : 0;\n}\n"; });
define('text!components/maze.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"components/maze.css\"></require>\n    <div class=\"row\"\n         repeat.for=\"row of cells\">\n        <div class=\"cell\"\n             class.bind=\"wallClass(cell)\"\n             repeat.for=\"cell of row\">\n        </div>\n\n    </div>\n</template>"; });
define('text!components/board.css', ['module'], function(module) { module.exports = "board {\n    position  : relative;\n    width     : 50vw;\n    height    : 50vw;\n    max-height: 100vh;\n    border    : 1px solid red;\n}\n"; });
define('text!components/maze.css', ['module'], function(module) { module.exports = "maze {\n    width           : 80vw;\n    height          : 80vw;\n    display         : flex;\n    flex-direction  : column;\n    border          : 2px solid #333;\n    background-color: rgba(255,255,255,0.5);\n    position        : absolute;\n    left            : 50%;\n    top             : 50%;\n    transform       : translate(-40vw,-40vw);\n}\n\n.row {\n    display       : flex;\n    flex-direction: row;\n    flex          : 1 0 auto;\n}\n\n.cell {\n    flex  : 1 0 auto;\n    border: 1px solid lightgray;\n    margin: -1px;\n}\n\n.wall0000 {\n    border-color: transparent transparent transparent transparent;\n}\n\n.wall0001 {\n    border-color: transparent transparent transparent #333;\n}\n\n.wall0010 {\n    border-color: transparent transparent #333 transparent;\n}\n\n.wall0011 {\n    border-color: transparent transparent #333 #333;\n}\n\n.wall0100 {\n    border-color: transparent #333 transparent transparent;\n}\n\n.wall0101 {\n    border-color: transparent #333 transparent #333;\n}\n\n.wall0110 {\n    border-color: transparent #333 #333 transparent;\n}\n\n.wall0111 {\n    border-color: transparent #333 #333 #333;\n}\n\n.wall1000 {\n    border-color: #333 transparent transparent transparent;\n}\n\n.wall1001 {\n    border-color: #333 transparent transparent #333;\n}\n\n.wall1010 {\n    border-color: #333 transparent #333 transparent;\n}\n\n.wall1011 {\n    border-color: #333 transparent #333 #333;\n}\n\n.wall1100 {\n    border-color: #333 #333 transparent transparent;\n}\n\n.wall1101 {\n    border-color: #333 #333 transparent #333;\n}\n\n.wall1110 {\n    border-color: #333 #333 #333 transparent;\n}\n\n.wall1111 {\n    border-color: #333 #333 #333 #333;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map