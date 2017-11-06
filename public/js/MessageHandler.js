/**
 * Created by Umpire on 28.10.2017.
 */


class MassageHandler {
    constructor(connection) {
        this.router = {};
        this.connection = connection;
        this.connection.onmessage = event => this.proccesMessage(event);
    }

    send(msg) {
        this.connection.send(msg);
    }
    
    register(command, reaction) {
        this.router[command] = reaction;
    }

    proccesMessage(event) {
        let msg = JSON.parse(event.data),
            command = msg.command;

        if(!this.router.hasOwnProperty(command)) {
            console.log('No action for ' + command + ' command')
        }

        this.router[command](msg.data);
    }
}
