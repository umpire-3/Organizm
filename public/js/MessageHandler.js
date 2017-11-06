/**
 * Created by Umpire on 28.10.2017.
 */


class MassageHandler {
    constructor(connection) {
        this.router = {};
        this.connection = connection;
        this.connection.onmessage = event => this.proccesMessage(event);

        this.router[undefined] = data => console.log(`Recived ${data} data`);
    }

    send(msg) {
        this.connection.send(msg);
    }
    
    use(command, handler) {
        this.router[command] = handler;
    }

    proccesMessage(event) {
        let msg = JSON.parse(event.data),
        {command, data} = msg;

        let handler = this.router[command];
        if (!handler) {
            console.log(`No action for ${command} command`);
            return;
        }
        
        handler(data);
    }
}
