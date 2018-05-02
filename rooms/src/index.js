import React from 'react';
import ReactDOM from 'react-dom';
var local = false;
var gameServer = local ? "http://localhost:3001" : "https://snakessss-server.herokuapp.com";
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
        this.setState({name :event.target.value});
    }
    saveName(event) {
        this.setState({
            input:false,
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
                {this.state.input ? <EditName name={this.state.name} onChange={this.nameChangedHandler} saveAction={this.saveName}/> : null}
            </div>
        )
    }
}

class EditName extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            name : props.name,
            parent: props.onChange
        };
        this.nameChangedHandler = this.nameChangedHandler.bind(this);
    }
    nameChangedHandler(event) {
        this.setState({name :event.target.value});
        this.state.parent(event);
    }
    render() {
        return (
            <div>
            <input type="text" value={this.state.name} onChange={this.nameChangedHandler}/>
            <button className="btn btn-primary" onClick={this.props.saveAction}>Save</button>
            </div>
        )
    }
}

class Rooms extends React.Component {
    constructor(props) {
        super(props);
        var seconds = new Date().getTime();
        this.state = {
            name: "player "+seconds,
            rooms: []
        }
        this.saveName = this.saveName.bind(this);
    }
    saveName(name) {
        this.setState({name: name})
    }
    async componentDidMount() {
        this.timer = setInterval(() => this.getRooms(), 1000);
    }

    async getRooms() {
        fetch(gameServer+"/roomlist")
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
                            <td><a href={gameServer +'/'+ room.room + "/" + this.state.name}>Join</a></td>
                        </tr>
                    )
                })
                this.setState({ rooms: pictures });
            })

    }

    render() {
        return (
            <div>
                <Name name={this.state.name} saveName={this.saveName}/>
                <h2>
                    <span>Room List</span>
                    <button className='btn btn-primary float-sm-right'>Create New Room</button>
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