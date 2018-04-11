var _ = require('lodash');

function Room(name) {
    this.name = name;
    this.snakes = {};
    this.state = 1;
    this.matchStartTimestamp = null;
}

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

module.exports = {Rooms: Rooms, Room: Room};