var Sequelize = require('sequelize');

var sequelize = new Sequelize({
    dialect: "sqlite",
    port: 3306
});

var menu = {
    mainCourses: [{
        name: "Hamburger",
        type: "sandwich"
    }, {
        name: "Cheeseburger",
        type: "sandwich"
    }, {
        name: "Crispy Chicken",
        type: "sandwich"
    }, {
        name: "Grilled Chicken",
        type: "sandwich"
    }, {
        name: "Spicy Chicken",
        type: "sandwich"
    }, {
        name: "PBJ (2)",
        type: "sandwich"
    }, {
        name: "Turkey",
        type: "wrap"
    }, {
        name: "Crispy Chicken",
        type: "wrap"
    }, {
        name: "Grilled Chicken",
        type: "wrap"
    }, {
        name: "Spicy Chicken",
        type: "wrap"
    }, {
        name: "Veggie",
        type: "wrap"
    }, {
        name: "Garden Deluxe",
        type: "salad"
    }, {
        name: "Chef's Turkey",
        type: "salad"
    }, {
        name: "Crispy Chicken",
        type: "salad"
    }, {
        name: "Grilled Chicken",
        type: "salad"
    }],
    sides: [
        "French Fries",
        "Miss Vickie's Chips",
        "Fresh Fruit",
        "Cup O' Soup",
        "Sweet Endings",
        "Side Salad",
        "Sweet N' Salty Bar",
        "Dannon Yogurt",
        "2% Milk"
    ],
    beverages: [
        "Fountain Soda",
        "2% Milk",
        "Fresh Brewed Coffee",
        "Lipton Tea"
    ]
};

var db = {
    sequelize: new Sequelize({
        dialect: "sqlite",
        port: 3306
    }),
    init: function() {
        this.sequelize
            .authenticate()
            .then((err) => {
                console.log("connected");
            }, (err) => {
                console.log('Unable to connect to the database:', err);
            });

        this.seedUsers();
        this.seedMenu();
        this.createOrdersTable();
        this.seedHours();
    },
    seedUsers: function() {
        this.User = this.sequelize.define('User', {
            username: Sequelize.STRING,
            password: Sequelize.STRING,
            admin: Sequelize.BOOLEAN
        });

        this.sequelize
            .sync()
            .then((err) => {
                this.User.create({
                    username: 'user',
                    password: 'test',
                    admin: false
                });

                this.User.create({
                    username: 'eric',
                    password: 'pass',
                    admin: true
                });
            });
    },
    seedMenu: function() {
        this.Menu = {};

        this.Menu.MainCourse = this.sequelize.define('MainCourse', {
            name: Sequelize.STRING,
            type: {
                type: Sequelize.ENUM,
                values: ["sandwich", "wrap", "salad"]
            },
            available: Sequelize.BOOLEAN
        });

        this.sequelize
            .sync({
                force: true
            })
            .then((err) => {
                for (var i = 0; i < menu.mainCourses.length; i++) {
                    this.Menu.MainCourse.create({
                        name: menu.mainCourses[i].name,
                        type: menu.mainCourses[i].type,
                        available: true
                    });
                }
            });

        this.Menu.Side = this.sequelize.define('Sides', {
            name: Sequelize.STRING,
            available: Sequelize.BOOLEAN
        });

        this.sequelize
            .sync({
                force: true
            })
            .then((err) => {
                for (var i = 0; i < menu.sides.length; i++) {
                    this.Menu.Side.create({
                        name: menu.sides[i],
                        available: true
                    });
                }
            });

        this.Menu.Beverage = this.sequelize.define('Beverages', {
            name: Sequelize.STRING,
            available: Sequelize.BOOLEAN
        });

        this.sequelize
            .sync({
                force: true
            })
            .then((err) => {
                for (var i = 0; i < menu.beverages.length; i++) {
                    this.Menu.Beverage.create({
                        name: menu.beverages[i],
                        available: true
                    });
                }
            });
    },
    createOrdersTable: function() {
        this.Order = this.sequelize.define('Order', {
            mainCourse: Sequelize.STRING,
            type: Sequelize.STRING,
            side1: Sequelize.STRING,
            side2: Sequelize.STRING,
            beverage: Sequelize.STRING,
            status: {
                type: Sequelize.ENUM,
                values: ["PLACED", "IN_PROGRESS", "FINISHED"]
            },
            userId: Sequelize.INTEGER,
            pickUpNow: Sequelize.BOOLEAN,
            pickUpTime: Sequelize.STRING
        });
    },
    createOrder: function(order, user_id) {
        this.sequelize
            .sync()
            .then((err) => {
                this.Order.create({
                    mainCourse: order.mainCourse,
                    type: order.type,
                    side1: order.side1,
                    side2: order.side2,
                    beverage: order.beverage,
                    status: "PLACED",
                    userId: user_id,
                    pickUpNow: order.pickUpNow,
                    pickUpTime: order.pickUpTime
                });
            });
    },
    seedHours: function(order, user_id) {
        this.Hours = this.sequelize.define('HoursOfOperation', {
            dayOfWeek: Sequelize.STRING,
            open: Sequelize.TIME,
            close: Sequelize.TIME
        });

        this.sequelize
            .sync({
                force: true
            })
            .then((err) => {
                this.Hours.create({
                    dayOfWeek: "Sunday",
                    open: null,
                    close: null
                });
                this.Hours.create({
                    dayOfWeek: "Monday",
                    open: new Date(0, 0, 0, 11, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
                this.Hours.create({
                    dayOfWeek: "Tuesday",
                    open: new Date(0, 0, 0, 11, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
                this.Hours.create({
                    dayOfWeek: "Wednesday",
                    open: new Date(0, 0, 0, 11, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
                this.Hours.create({
                    dayOfWeek: "Thurdsay",
                    open: new Date(0, 0, 0, 11, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
                this.Hours.create({
                    dayOfWeek: "Friday",
                    open: new Date(0, 0, 0, 11, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
                this.Hours.create({
                    dayOfWeek: "Saturday",
                    open: new Date(0, 0, 0, 17, 0, 0).toLocaleTimeString(),
                    close: new Date(0, 0, 0, 23, 0, 0).toLocaleTimeString()
                });
            });
    }
};

module.exports = db;
