const directions = [[0, -1], [+1, 0], [0, +1], [-1, 0]];
let cells = [];
let markedCells = [];
let searchTree = null;
let direction = '';
let player = null;


// Thanks to Stephanie Wong https://medium.com/@stephaniewo/understanding-breadth-first-tree-traversal-with-javascript-9b8fe670176d
let buildBFTree = (startXY, parentNode) => {
    markedCells = copyMazeWithMarks();
    let queue = [];
    let counter = 0;
    let root = treeNode(parentNode, startXY);
    queue.push(root);

    while (queue.length > 0) {
        let node = queue.shift();
        markCell(node.xy);
        cells[node.xy[1]][node.xy[0]].forEach((wall, i) => {
            if ((wall === 0)) {
                let neighbour = getNeighbourXY(node.xy, i);
                if (unMarkedCell(neighbour)) {
                    let nextNode = treeNode(node, neighbour);
                    node.children.push(nextNode);
                    queue.push(nextNode);
                }
            }
        });
    }
    return root;
};

let clearData = () => {
    player = null;
    direction = undefined;
    searchTree = null;
    markedCells = [];
};

let copyMazeWithMarks = () => {
    return cells.map(row => {
        return row.map(cell => {
            return false;
        });
    });
};

let getDirectionToClosestPlayer = (targetPositions) => {
    let isTargetPosition = (xy) => {
        return targetPositions.some(pos => {
            return (pos[0] === xy[0]) && (pos[1] === xy[1]);
        });
    };
    let queue = [];
    let results = [];
    let target = null;
    let root = searchTree;
    queue.push(root);
    while (queue.length > 0 && !target) {
        let node = queue.shift();
        node.children.forEach(child => {
            queue.push(child);
        });
        target = (isTargetPosition(node.xy)) ? node : null;
    }
    while (target.parent && target.parent.parent) {
        target = target.parent;
    }
    // dx and dy are -1, 0 or 1, so add 1 to use lookup table
    let dx = target.xy[0] - root.xy[0] + 1;
    let dy = target.xy[1] - root.xy[1] + 1;
    let directions = [
        ['', 'up', ''],
        ['left', '', 'right'],
        ['', 'down', '']
    ];
    return directions[dy][dx];
};

let getNeighbourXY = (xy, wall) => {
    return xy.map((xy, i) => {
        return xy += directions[wall][i];
    });
};

let handleRequest = (data) => {
    player = data.player;
    let position = [data.player.x, data.player.y];
    searchTree = buildBFTree(position, null);
    direction = getDirectionToClosestPlayer(data.targetPositions);
    sendFeedBack('direction');
};

let initVariables = (data) => {
    cells = data.cells;
};

let markCell = (xy) => {
    markedCells[xy[1]][xy[0]] = true;
};

let sendFeedBack = (message) => {
    let workerData = {
        message: message,
    };
    switch (message) {
        case 'direction':
            workerData.player = player;
            workerData.direction = direction;
            break;
        default:
            break;
    }
    postMessage(workerData);
    clearData();
};

let treeNode = (parent, xy) => {
    return {
        parent: parent,
        children: [],
        xy: xy,
    };
};

let unMarkedCell = (xy) => {
    return !markedCells[xy[1]][xy[0]];
};

onmessage = function (e) {
    let message = e.data.message;
    switch (message) {
        case 'initMaze':
            initVariables(e.data);
            break;
        case 'getDirection':
            handleRequest(e.data);

            break;
        default:
            break;
    }
    // sendFeedBack('finish');
};