var pixelSize = 10;
var arena = new Arena();
var panel;
var socket = io();
var gameState = 1;
// 1: not running
// 2: starting
// 3: running
// 4: game is over
var userState = 1;
// 1 : not connected, choose color
// 2 : connected, color chosen, prompt readiness
// 3 : Ready, waiting for other
var keyInput, chooseColorOptions, readySwitch;
var room = "101";
var playerInRoom = [];

// TODO: Hack name
var names = [
    "Nasyarobby",
    "Nugraha",
    "Robby",
    "NSRB",
    "NSRB1987",
    "Zenn"
];

var name = names[randomIntFromInterval(0, 5)];
var playerId;
function setup() {
    engine.canvas.width = 610;
    engine.canvas.height = 360;
    engine.fps = 60;
    engine.background.color = "black";
    panel = new Panel(arena.w * pixelSize, 0, engine.canvas.width - arena.w * pixelSize, engine.canvas.height);
    panel.background.color = "white";

    scoreBoxes = [];
    for(let i=0; i<4;i++) {
        scoreBoxes.push(new ScoreBox(i, 0, 0, 0+i*40));
    }
    scoreBox = new ScoreBoxes(scoreBoxes);

    chooseColorOptions = new ColorOptions("snake color", [
        "#ffdc30",
        "#00b2ff",
        "#c532ff",
        "green"
    ], 50, 0);

    readySwitch = new ReadySwitch("ready switch", [{
        color: "#68e22b",
        text: "Ready"
    },
    {
        color: "#ccc",
        text: "Not Ready"
    }
    ], 0, 180);

    //try to join the current room
    socket.emit("join", {
        name: name,
        room: room
    });
}

function loop() {
    // update anything here
    update();
    // and then render it here
    arena.render();
    panel.render();
}

function update() {

    // if player only 1
    if(playerInRoom.length <= 1) {
        gameState = 1;
    }

    switch (userState) {
        case 1:
            if(gameState == 2 || gameState==3)
            arena.message = "Game is running. Please wait.";
            else
            arena.message = "Please choose a color.";
            panel.objects = [
                scoreBox,
                chooseColorOptions
            ];
            break;
        case 2:
            arena.message = "Switch to ready when you're ready.";
            panel.objects = [
                scoreBox,
                chooseColorOptions,
                readySwitch
            ];
            break;
        case 3:
            if (gameState == 2) {

            }
            else if (gameState == 3) {
                arena.message = null;
            }
            else if(gameState == 4) {
                if(playerInRoom[playerId].win)
                    arena.message = "You win!";
                else
                    arena.message = "You lose!";
            }
            else {
                arena.message = "Waiting other players to be ready...";
            }
            panel.objects = [
                scoreBox,
                chooseColorOptions,
                readySwitch
            ];
            break;
        case 99:
            arena.message = "Disconnected."
    }
    arena.update();
    panel.update();
    keyInput = null;
}

socket.on("timer", function (data) {
    second = data.timeLeft < 3000 ? data.timeLeft / 1000 : Math.floor(data.timeLeft / 1000);
    arena.message = "Game is starting in " + second + ' seconds';
});

socket.on("pixels", function (data) {

    arena.pixels = [];
    data.forEach(function (p) {
        arena.pixels.push(new Pixel(p.x, p.y, p.color));
    });

});

socket.on("players information", function (data) {
    playerInRoom = data;
    data.forEach(player => {
        if(player.win) {
            gameState = 4;
        }
    });
});

socket.on("new state", function (data) {
    gameState = data.state;
});

socket.on("register", data => {
    if (data.result) {
        console.log(data);
        userState = 2;
        playerId = data.id;
    }
})

function Arena() {
    this.x = 0;
    this.y = 0;
    this.w = 36;
    this.h = 36;
    this.pixels = [];
    this.message;
}

Arena.prototype.render = function () {
    var ctx = engine.context;
    if(gameState!=4) {
        for (let i = 0; i < this.pixels.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = this.pixels[i].color;
            ctx.rect(this.x + this.pixels[i].x * pixelSize, this.y + this.pixels[i].y * pixelSize, pixelSize, pixelSize);
            ctx.strokeStyle = engine.background.color;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    this.displayMessage(this.message, 200, 60);
}

Arena.prototype.displayMessage = function (content, w = 200, h = 120) {
    if (this.message === undefined || this.message == null)
        return false;
    var width = w;
    var height = h;
    var ctx = engine.context;
    ctx.beginPath();
    ctx.fillStyle = "#999";
    ctx.rect((this.w * pixelSize - width) / 2, (this.h * pixelSize - height) / 2, width, height);
    ctx.strokeStyle = "#666";
    ctx.fill();
    ctx.stroke();
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(content, (this.w * pixelSize) / 2, (this.h * pixelSize) / 2);
}

Arena.prototype.closeMessage = function () {
    this.message = null;
}

Arena.prototype.update = function () {
    if (gameState == 3) {
        switch (keyInput) {
            case 65: // A
                socket.emit('input', {
                    direction: 'left'
                });
                break;
            case 87: // W
                socket.emit('input', {
                    direction: 'up'
                });
                break;
            case 68: // D
                socket.emit('input', {
                    direction: 'right'
                });
                break;
            case 83: // S
                socket.emit('input', {
                    direction: 'down'
                });
                break;
        }
    }
}

// PANEL
// sidebar
function Panel(x, y, h, w) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    var thispanel = this;
    this.background = {
        color: "#42d9f4",
        draw: function (color = null) {
            if (color != null)
                this.color = color;
            engine.context.fillStyle = this.color;
            engine.context.fillRect(thispanel.x, thispanel.y, thispanel.h, thispanel.w);
        }
    };

}

Panel.prototype.update = function () {
    this.objects.forEach(function (e) {
        e.update(panel);
    });
}
Panel.prototype.render = function () {
    this.background.draw();
    this.objects.forEach(function (e) {
        e.render(panel);
    });
}

// SideBar Object
function TextObject(txt, x, y, align = "left") {
    this.text = txt;
    this.x = x;
    this.y = y;
    this.align = align;
    var parent = this;
    this.render = function (panel) {
        var ctx = engine.context;
        ctx.beginPath();
        ctx.font = "12px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(parent.text, panel.x + parent.x, panel.y + parent.y + 10);
    }
    this.update = function (panel) {

    }
}

function ScoreBoxes(boxes) {
    this.boxes = boxes;
}

ScoreBoxes.prototype.render = function (panel) {
    this.boxes.forEach(e => {
        e.render(panel);
    });
}

ScoreBoxes.prototype.update = function (panel) {
    this.boxes.forEach(e => {
        e.update(panel);
    });
}

function ScoreBox(owner, score, x = 0, y = 0) {
    this.owner = owner;
    this.score = score;
    this.x = x;
    this.y = y;
}

ScoreBox.prototype.render = function (panel) {
    var ctx = engine.context;
    ctx.beginPath();
    ctx.fillStyle = "#004080";
    ctx.rect(
        this.x + panel.x + 10,
        this.y + panel.y + 40,
        40,
        30);
    ctx.fill();

    ctx.beginPath();
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.score, this.x + panel.x + 30, this.y + panel.y + 60);
}

ScoreBox.prototype.update = function (panel) {
    if(playerInRoom[this.owner] != undefined && playerInRoom[this.owner].score != undefined)
    this.score = playerInRoom[this.owner].score;
    else
    this.score = "X";
}

function ColorOptions(name, options, x = 0, y = 0) {
    this.options = options;
    this.name = name;
    this.cursor = 0;
    this.x = x;
    this.y = y;
}

ColorOptions.prototype.render = function (panel) {
    var ctx = engine.context;
    for (let i = 0; i < this.options.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = this.options[i];
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.rect(
            this.x + panel.x + 10,
            this.y + panel.y + (i * 40) + 40,
            180,
            30);
        ctx.fill();
        if (this.cursor == i)
            ctx.stroke();
        for (let j = 0; j < playerInRoom.length; j++) {
            if (playerInRoom[j].id == i) {
                ctx.beginPath();
                ctx.font = "12px Arial";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(playerInRoom[j].name, this.x + panel.x + 100, this.y + panel.y + (i * 40) + 60);
            }
        }
    }
};
ColorOptions.prototype.update = function (panel) {
    if (userState == 1) {
        switch (keyInput) {
            case 87:
                this.cursor--;
                if (this.cursor < 0) {
                    this.cursor = this.options.length - 1;
                }
                break;
            case 83:
                this.cursor++;
                if (this.cursor >= this.options.length)
                    this.cursor = 0;
                break;
            case 13:
                this.selected();
                break;
        }
    }
};
ColorOptions.prototype.selected = function () {
    socket.emit(this.name, {
        index: this.cursor,
        value: this.options[this.cursor]
    });
}

function ReadySwitch(name, options, x = 0, y = 0) {
    this.options = options;
    this.name = name;
    this.cursor = 1;
    this.x = x;
    this.y = y;
}

ReadySwitch.prototype.render = function (panel) {
    var ctx = engine.context;
    for (let i = 0; i < this.options.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = this.options[i].color;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.rect(
            this.x + panel.x + 10,
            this.y + panel.y + (i * 40) + 40,
            230,
            30);
        ctx.fill();
        if (this.cursor == i)
            ctx.stroke();
        ctx.beginPath();
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.options[i].text, this.x + panel.x + 125, this.y + panel.y + (i * 40) + 60);
    }
};
ReadySwitch.prototype.update = function (panel) {
    if ((userState == 2 || userState == 3) && gameState != 3) {
        switch (keyInput) {
            case 87:
                this.cursor--;
                if (this.cursor < 0) {
                    this.cursor = this.options.length - 1;
                }
                this.selected();
                break;
            case 83:
                this.cursor++;
                if (this.cursor >= this.options.length)
                    this.cursor = 0;
                this.selected();
                break;
        }
    }
};
ReadySwitch.prototype.selected = function () {
    if (this.cursor === 0) {
        userState = 3;
        gameState = 1;
    }
    else {
        userState = 2;
        gameState = 1;
    }
    socket.emit(this.name, {
        index: this.cursor,
        value: this.options[this.cursor]
    });
}


function Pixel(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}

socket.on("join", function (data) {
    console.log("joined.")
});

socket.on("disconnect", function (data) {
    userState = 99;
});

document.addEventListener('keydown', function (event) {
    keyInput = event.keyCode;
});

//CLIENT'S HELPERS
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}