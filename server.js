// https://gist.github.com/crtr0/2896891
// https://socket.io/get-started/chat/
var express = require("express");
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;
var _ = require('lodash');

var lastUpdateTime = (new Date()).getTime();
//var rooms = {};
var rooms = new Rooms();
var arena = {
    cols: 36,
    rows: 36
}
var countdownLength = 10;

function Room(name) {
    this.name = name;
    this.snakes = {};
    this.state = 1;
    this.matchStartTimestamp = null;
}

/* OBJECT: Room */

Room.prototype.getSnakes = function () {
    return this.snakes;
}
Room.prototype.getState = function () {
    return this.state;
}

Room.prototype.isRunning = function () {
    return this.getState() == 3 || this.getState() == 2;
}

Room.prototype.everybodyIsReady = function () {
    return _.every(_.map(this.snakes, function (s) {
        return s.ready;
    }), Boolean);
}

Room.prototype.getTimeLeftSocketMessage = function () {
    let timeLeft = this.matchStartTimestamp - Date.now();
    return {
        timeLeft: timeLeft
    };
}

Room.prototype.getPixelsSocketMessage = function () {
    state = _.flatten(_.map(this.snakes, function (s) {
        return _.map(s.body, function (b) {
            return _.pick(b, ['x', 'y', 'color'])
        });
    }));
    return state;
}

Room.prototype.getPlayersInfoSocketMessage = function () {
    state = (_.map(this.snakes, function (s) {
        return _.pick(s, ['id', 'color', 'name'])
    }));
    return state;
}

Room.prototype.changeGameState = function (newState) {
    this.state = newState;
    io.in(this.getName()).emit("new state", {
        state: newState
    });
}

Room.prototype.getSnakeById = function (socketId) {
    return _.find(this.snakes, {
        id: socketId
    })
}

Room.prototype.getSnakeById = function (socketId) {
    return _.find(this.snakes, {
        id: socketId
    })
}

Room.prototype.getName = function () {
    return this.name;
}

Room.prototype.initCountdown = function (length) {
    this.matchStartTimestamp = Date.now() + 1000 * length;
}

Room.prototype.getNumberOfSnakes = function () {
    return _.values(this.getSnakes()).length;
}

/* OBJECT: ROOM */

function Rooms() {
    this.rooms = {};
}

Rooms.prototype.initRoom = function (roomName) {
    if (this.rooms[roomName] === undefined) {
        this.rooms[roomName] = new Room(roomName);
    }
    return this.rooms[roomName];
}

Rooms.prototype.deleteSnakeBySocketId = function (socketid) {
    for (r in this.rooms) {
        for (s in this.rooms[r].getSnakes()) {
            if (s == socketid) {
                delete this.rooms[r].snakes[s];
            }
        }
    }
}

Rooms.prototype.getSnakeBySocketId = function (socketid) {
    for (r in this.rooms) {
        for (s in this.rooms[r].getSnakes()) {
            if (s == socketid) {
                console.log(this.rooms[r].snakes[s])
                return this.rooms[r].snakes[s];
            }
        }
    }
}

io.on("connection", function (socket) {
    // everytime a user connect to a room.
    socket.on("join", function (data) {
        var room = data.room;
        var clientName = data.name;
        var currentRoom;

        socket.join(room, function (data) {
            currentRoom = rooms.initRoom(room);
            console.log(clientName + ' has joined ' + currentRoom.getName());

            socket.emit("new state", {state: currentRoom.getState()});

            socket.on("snake color", function (data) {
                var requestedId = data.index;
                console.log(clientName + ' has choosen ' + data.value);
                //if (_.find(rooms[room]["snakes"], {
                //        id: data.index
                //    })) {
                if (currentRoom.getSnakeById(requestedId) || currentRoom.isRunning()) {
                    socket.emit('register', {
                        result: false,
                        id: data.index
                    })
                } else {

                    currentRoom.snakes[socket.id] = new Snake(
                        //rooms[room]["snakes"][socket.id] = new Snake(
                        randomIntFromInterval(0, arena.cols),
                        randomIntFromInterval(0, arena.rows),
                        data.value,
                        data.index,
                        clientName
                    );
                    //var snake = rooms[room]["snakes"][socket.id];
                    var snake = currentRoom.snakes[socket.id];
                    socket.emit('register', {
                        result: true,
                        id: snake.id
                    })

                    socket.on("ready switch", function (data) {

                        playerIsReady = data.index == 0;

                        if (playerIsReady) {
                            snake.ready = true;
                            console.log(clientName + ' is ready');

                            // check if everybody is ready
                            //if (everybodyIsReady(room) && allSnakes(room).length > 1) {
                            console.log(currentRoom.getNumberOfSnakes());
                            if (currentRoom.everybodyIsReady() && currentRoom.getNumberOfSnakes() > 1) {
                                console.log("Everyone is ready. Starting the game in room " + room + " in ");
                                currentRoom.changeGameState(2); //changeGameState(room, 2);
                                currentRoom.initCountdown(countdownLength); //initCountdown(rooms[room], countdownLength);
                            }
                        } else {
                            console.log("Game countdown is aborted.");
                            currentRoom.changeGameState(1); //changeGameState(room, 1);
                            snake.ready = false;
                            console.log(clientName + ' is not ready');
                        }
                    });
                }
            });

            setInterval(function () {
                snake = currentRoom.snakes[socket.id];
                if (snake === undefined)
                    return

                if (currentRoom.state == 3)
                    snake.update();
                else if (currentRoom.state == 2) {
                    let timeLeft = currentRoom.getTimeLeftSocketMessage();
                    if (timeLeft.timeLeft <= 0)
                        currentRoom.changeGameState(3);
                    else
                        io.in(room).emit("timer", timeLeft);
                }
                io.in(room).emit("pixels", currentRoom.getPixelsSocketMessage());
                io.in(room).emit("players information", currentRoom.getPlayersInfoSocketMessage());
            }, 1000 / 20);
        });
    });



    socket.on("input", function (data) {
        //snake = rooms["101"]["snakes"][socket.id];
        snake = rooms.getSnakeBySocketId(socket.id);
        if(snake !== undefined) {
            switch (data.direction) {
                case "up":
                    snake.changeDirection("up");
                    break;
                case "down":
                    snake.changeDirection("down");
                    break;
                case "left":
                    snake.changeDirection("left");
                    break;
                case "right":
                    snake.changeDirection("right");
                    break;
            }
        }
    });

    socket.on("disconnect", function (data) {
        rooms.deleteSnakeBySocketId(socket.id);
    });

});

/* SERVER'S HELPERS */

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/* EXPRESS */

app.use(express.static('client'));
server.listen(port, function () {});
app.get('/jquery.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
})
app.get('/rooms', function (req, res) {
    var roomList = _.keys(rooms);
    var html = roomList.join('<br />');
    html += '<hr />';
    res.send(html);
});

/* IN-GAME OBJECTS */
/* OBJECT: Cell*/
function Cell(x, y, parent = null, color = "white") {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.color = color;
}

/* OBJECT: Wall */
function Wall(x, y, arena) {
    Cell.call(this, x, y, arena, 99);
}

Wall.prototype = Object.create(Cell.prototype);
Wall.prototype.constructor = Wall;

/* OBJECT: SnakeHead */
function SnakeHead(x, y, snake, color) {
    Cell.call(this, x, y, snake, color);
}

SnakeHead.prototype = Object.create(Cell.prototype);
SnakeHead.prototype.constructor = SnakeHead;
SnakeHead.prototype.grow = function (x) {
    this.parent.length += x;
}
SnakeHead.prototype.eatFruit = function () {
    this.grow(1);
    this.parent.score++;
}
SnakeHead.prototype.dead = function () {
    this.parent.dead();
}
/* OBJECT: SnakeBody */
function SnakeBody(x, y, snake, color) {
    Cell.call(this, x, y, snake, color);
}

SnakeBody.prototype = Object.create(Cell.prototype);
SnakeBody.prototype.constructor = SnakeBody;

function Fruit(x, y) {
    Cell.call(this, x, y, arena, "green");
}

/* OBJECT: Fruit */
Fruit.prototype = Object.create(Cell.prototype);
Fruit.prototype.constructor = Fruit;
Fruit.prototype.getEaten = function () {
    //deleteFruit(this);
    //generateFruit();
}

/* OBJECT: Snake */
function Snake(startingX, startingY, color, id, name) {
    this.body = [];
    this.color = color;
    this.id = id;
    this.name = name;
    this.body.push(new SnakeHead(startingX, startingY, this, this.color));
    this.xSpeed = 1;
    this.ySpeed = 0;
    this.length = 10;
    this.score = 0;
    this.ready = false;

    this.changeDirection = function (direction) {
        if (direction == 'up' && this.ySpeed != 1) {
            this.xSpeed = 0;
            this.ySpeed = -1;
        } else if (direction == 'right' && this.xSpeed != -1) {
            this.xSpeed = 1;
            this.ySpeed = 0;
        } else if (direction == 'down' && this.ySpeed != -1) {
            this.xSpeed = 0;
            this.ySpeed = 1;
        } else if (direction == 'left' && this.xSpeed != 1) {
            this.xSpeed = -1;
            this.ySpeed = 0;
        }
    }

    this.update = function () {
        if (this.ready) {
            let x = this.length != this.body.length ? this.body.length : this.length;
            for (let i = 0; i < x; i++) {
                let b = this.body[i];

                if (b.x >= arena.cols) {
                    b.x = 0;
                } else if (b.x < 0) {
                    b.x = arena.cols;
                }

                if (b.y >= arena.rows) {
                    b.y = 0;
                } else if (b.y < 0) {
                    b.y = arena.rows;
                }
            }

            this.body.unshift(new SnakeHead(this.head().x, this.head().y, this, this.color));
            let oldHead = this.body[1];
            this.body[1] = new SnakeBody(oldHead.x, oldHead.y, this, this.color);
            this.head().x += this.xSpeed;
            this.head().y += this.ySpeed;

            if (this.body.length > this.length) {
                this.body.pop();
            }
        }

        return this.body;
    }

    this.head = function () {
        return this.body[0];
    }

    this.shrink = function (x = 1) {
        this.length -= x;
        for (let i = 0; i < x; i++)
            this.body.pop();
    }

    this.dead = function () {
        let frame = frameCount;
        console.log("dead");
        this.body = [];
        this.body.push(new SnakeHead(getRandomPos(), getRandomPos(), this));
    }
}