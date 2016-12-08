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
    db.sequelize
        .sync()
        .then((err) => {
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
});

app.post('/menu', (req, res) => {
    var item = req.body.menuItem;
    console.log(item);
    if (item.category == "Main Course") {
        db.Menu.MainCourse.update({
          available: item.available
        }, {
          fields: ['available'],
          where: {
            name: item.name,
            type: item.type
          }
        });
    } else if (item.category == "Side") {
      db.Menu.Side.update({
        available: item.available
      }, {
        fields: ['available'],
        where: {
          name: item.name
        }
      });
    } else if (item.category == "Beverage") {
      db.Menu.Beverage.update({
        available: item.available
      }, {
        fields: ['available'],
        where: {
          name: item.name
        }
      });
    }

    res.send({success: true});
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

app.get('/order/by_user/:userId', (req, res) => {
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

app.get('/order', (req, res) => {
    db.Order.findAll().then((orders) => {
        res.send({
            orders: orders
        });
    });
});

app.put('/order/:orderId', (req, res) => {
    db.Order.find({
        where: {
            id: req.params.orderId
        }
    }).then((order) => {
        order.update({
            status: req.body.status
        }).then(() => {
            db.Order.findAll().then((orders) => {
                res.send({
                    orders: orders
                });
            });
        });
    });
});

app.put('/hours/:id', (req, res) => {
    db.Hours.find({
        where: {
            id: req.params.id
        }
    }).then((hours) => {
        var open = req.body.open === undefined ? null : req.body.open;
        var close = req.body.close === undefined ? null : req.body.close;
        hours.update({
            open: open,
            close: close
        }).then(() => {
            db.Hours.findAll().then((hours) => {
                res.send({
                    hoursOfOperation: hours
                });
            });
        });
    });
});

app.get('/users', (req, res) => {
  db.User.findAll().then((users) => {
    res.send({
      users: users
    });
  });
});
