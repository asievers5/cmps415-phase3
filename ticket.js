let mongoose = require('mongoose')

let ticketSchema = new mongoose.Schema({
    name: String,
    issue: String,
    employeenum: Number
});

module.exports = mongoose.model("Ticket", ticketSchema)