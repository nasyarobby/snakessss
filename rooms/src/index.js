import React from 'react';
import ReactDOM from 'react-dom';
// change following line to deploy in public server
var publicServerAddress = "";
var gameServer = typeof publicServerAddress == undefined && publicServerAddress ? publicServerAddress : "http://localhost:3001";

class CreateRoomButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: ''
        }
        this.createNewRoom = this.createNewRoom.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    createNewRoom(event) {
        console.log(this.state);
        fetch(gameServer + "/createroom", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                roomName: this.state.roomName
            })
        })
    }

    onChangeHandler(event) {
        this.setState({ roomName: event.target.value });
    }

    render() {
        return (
            <span>
                <button type="button" className="btn btn-primary float-sm-right" data-toggle="modal" data-target="#createRoomFormModal">Create Room</button>
                <div className="modal fade" id="createRoomFormModal" tabindex="-1" role="dialog" aria-labelledby="createRoomFormModal" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Create A Room</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input name="new-room-name" id="newroomnameinput" placeholder="Room Name" value={this.state.roomName} onChange={this.onChangeHandler} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" onClick={this.createNewRoom} data-dismiss="modal">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </span>
        );
    }
}

class Name extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            input: false,
            parentSaveName: props.saveName
        }
        this.clickHandler = this.clickHandler.bind(this);
        this.nameChangedHandler = this.nameChangedHandler.bind(this);
        this.saveName = this.saveName.bind(this)
    }
    nameChangedHandler(event) {
        this.setState({ name: event.target.value });
    }
    saveName(event) {
        this.setState({
            input: false,
        })
        this.state.parentSaveName(this.state.name)
    }
    clickHandler() {
        this.setState({
            input: true
        })
    }

    render() {
        return (
            <div>
                <h1>Hi, <a href="#" onClick={this.clickHandler}>{this.state.name}</a></h1>
                {this.state.input ? <EditName name={this.state.name} onChange={this.nameChangedHandler} saveAction={this.saveName} /> : null}
            </div>
        )
    }
}

class EditName extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            parent: props.onChange
        };
        this.nameChangedHandler = this.nameChangedHandler.bind(this);
    }
    nameChangedHandler(event) {
        this.setState({ name: event.target.value });
        this.state.parent(event);
    }
    render() {
        return (
            <div>
                <input type="text" value={this.state.name} onChange={this.nameChangedHandler} />
                <button className="btn btn-primary" onClick={this.props.saveAction}>Save</button>
            </div>
        )
    }
}

class Rooms extends React.Component {
    constructor(props) {
        super(props);
        var seconds = new Date().getTime() % 10000;
        this.state = {
            name: "Player" + seconds,
            rooms: []
        }
        this.saveName = this.saveName.bind(this);
    }
    saveName(name) {
        this.setState({ name: name })
    }
    async componentDidMount() {
        this.timer = setInterval(() => this.getRooms(), 1000);
    }

    async getRooms() {
        fetch(gameServer + "/roomlist")
            .then(results => results.json())
            .then(data => {
                let id = 0;
                let pictures = data.results.map(room => {
                    id++;
                    let snakes = [];
                    room.snakes.forEach(e => {
                        snakes[e.id] = e;
                    })
                    return (
                        <tr key={room.room}>
                            <td>{id}</td>
                            <td>{room.room}</td>
                            <td>{snakes[0] ? snakes[0].name : ""} {snakes[0] ? "(" + snakes[0].score + ")" : ""}</td>
                            <td>{snakes[1] ? snakes[1].name : ""} {snakes[1] ? "(" + snakes[1].score + ")" : ""}</td>
                            <td>{snakes[2] ? snakes[2].name : ""} {snakes[2] ? "(" + snakes[2].score + ")" : ""}</td>
                            <td>{snakes[3] ? snakes[3].name : ""} {snakes[3] ? "(" + snakes[3].score + ")" : ""}</td>
                            <td><a href={gameServer + '/' + window.btoa(room.room) + "/" + window.btoa(this.state.name)} target="_blank">Join</a></td>
                        </tr>
                    )
                })
                this.setState({ rooms: pictures });
            })

    }

    render() {
        return (
            <div>
                <Name name={this.state.name} saveName={this.saveName} />
                <h2>
                    <span>Room List</span>
                    <CreateRoomButton />
                </h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Room Name</th>
                            <th scope="col">Player 1</th>
                            <th scope="col">Player 2</th>
                            <th scope="col">Player 3</th>
                            <th scope="col">Player 4</th>
                            <th scope="col">Join</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.rooms}
                    </tbody>
                </table>

            </div>
        );
    }
}

ReactDOM.render(
    <Rooms />,
    document.getElementById('root')
)