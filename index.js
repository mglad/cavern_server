var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('./db');
var moment = require('moment');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.listen(3000);

db.init();

app.post('/user', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.send({
            Error: "Must have username and password"
        });
        return;
    }
    db.sequelize
        .sync()
        .then((err) => {
            db.User.find({
                where: {
                    username: req.body.username
                }
            }).then((user) => {
                if (user && user.password === req.body.password) {
                    res.send({
                        success: true,
                        user: user
                    });
                } else {
                    res.send({
                        success: false
                    });
                }
            });
        });
});

app.get('/menu', (req, res) => {
    db.Menu.MainCourse.findAll().then((mainCourses) => {
        db.Menu.Side.findAll().then((sides) => {
            db.Menu.Beverage.findAll().then((beverages) => {
                res.send({
                    mainCourses: mainCourses,
                    sides: sides,
                    beverages: beverages
                });
            });
        });
    });
});

app.get('/hours', (req, res) => {
    db.Hours.findAll().then((hours) => {
        res.send({
            hoursOfOperation: hours
        });
    });
})
var isValidOrderTime = function(order, hours) {
    if (!order.pickUpNow) {
        var requestedDateTimeString = order.date + " " + order.time;
        var requestedDateTime = moment(requestedDateTimeString, "MM/DD/YY hh:mm:ss A");

        if (requestedDateTime.diff(moment(), 'minutes') < 15) {
            return "The pickup time must be at least 15 minutes from now.";
        }
        var day = hours[requestedDateTime.weekday()];
        var openTime = moment(day.open, "hh:mm:ss A");
        var closeTime = moment(day.close, "hh:mm:ss A");
        var requestedTime = moment(order.time, "hh:mm:ss A");
        if (!requestedTime.isBetween(openTime, closeTime)) {
            return "The pickup time must be during operating hours";
        }
    }
    return null;
};

app.post('/order', (req, res) => {
    db.Hours.findAll().then((hours) => {
        var error = isValidOrderTime(req.body.order, hours);
        if (error === null) {
            var order = req.body.order;
            order.pickUpTime = moment(order.date + " " + order.time, "MM/DD/YY hh:mm:ss A").format();
            console.log(order.pickUpTime);
            db.createOrder(req.body.order, req.body.user.id);
            res.send({
                success: true
            });
        } else {
            res.send({
                success: false,
                error: error
            });
        }
    });
});
app.get('/order/:userId', (req, res) => {
    db.Order.findAll({
        where: {
            userId: req.params.userId
        }
    }).then((orders) => {
        res.send({
            orders: orders
        });
    });
});
