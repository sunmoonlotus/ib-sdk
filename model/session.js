"use strict";

var Events = require("events"),
    System = require("./system"),
    Accounts = require("./accounts"),
    Positions = require("./positions"),
    Orders = require("./orders"),
    Executions = require("./executions"),
    Security = require("./security"),
    parse = require("./contract"),
    Environment = require("./environment");

class Session extends Events {
    
    constructor(service) {
        super();
        
        this.service = service;
        
        this.service.socket
            .on("connected", () => {
                this.emit("connected");
            }).on("disconnected", () => {
                this.emit("disconnected");
            });
    }
    
    system() {
        return new System(this.service);
    }
    
    accounts() {
        return new Accounts(this.service);
    }
    
    positions() {
        return new Positions(this.service);
    }
    
    orders() {
        return new Orders(this.service);
    }
    
    executions() {
        return new Executions(this.service);
    }
    
    security(description, cb) {
        let summary = null;
        try { summary = parse(description); }
        catch (ex) { cb(ex); return; }
        
        this.service.contractDetails(summary)
            .on("data", contract => cb(null, new Security(this.service, contract)))
            .on("error", err => cb(err))
            .send();
    }
    
    environment(options, symbolDefaults) {
        return new Environment(this, options, symbolDefaults);
    }
    
}

module.exports = Session;