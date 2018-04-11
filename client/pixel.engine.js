var engine;

docReady(function () {
    engine = new Engine();
    engine.setup();
    setInterval(function () {
        engine.background.draw();
        engine.loop();
        engine.frameCount++;
    }, 1000 / engine.fps);
});

function Engine() {
    this.fps = 60;
    this.frameCount = 0;
    this.setCanvas(document.getElementById('canvas'), 100, 100, '2d');
    this.background = {
        color: "white",
        draw: function (color = null) {
            if (color != null)
                this.color = color;
            engine.context.fillStyle = this.color;
            engine.context.fillRect(0, 0, engine.canvas.width, engine.canvas.height);
        }
    };
}

Engine.prototype.loop = function () {
    loop();
}

Engine.prototype.setup = function () {
    setup();
}


Engine.prototype.setCanvas = function (canvas, w, h, ctx = '2d') {
    if (canvas == null) throw "Error. Cannot find canvas.";
    this.canvas = canvas;
    this.canvas.width = w;
    this.canvas.height = h;
    this.context = canvas.getContext('2d');
}

Engine.prototype.setFPS = function (fps) {
    this.fps = fps;
}