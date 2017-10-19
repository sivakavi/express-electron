module.exports = () => {
  // Load The FS Module & The Config File
  fs = require('fs');

  // Load The Path Module
  path = require('path');

  engine = require('ejs-locals');

  config = JSON.parse(fs.readFileSync('config.json'));

  var Sequelize = require('sequelize');

  // Load Express Module
  express = require('express');
  app = express();

  // Load Body Parser Module
  bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Load Express Handlebars Module & Setup Express View Engine
  // expressHandlebars = require('express-handlebars');
  // app.set('views', __dirname+'/views/'); // Set The Views Directory
  // app.engine('html', expressHandlebars({ // Setup View Engine Middleware

  //   layoutsDir:__dirname + '/views/layouts',
  // 	defaultLayout: 'main',
  // 	extname: '.html',
  // 	helpers: {
  // 		section: function(name, options) {

  // 			if(!this._sections) {
  // 				this._sections = {};
  // 			}

  // 			this._sections[name] = options.fn(this);
  // 			return null;
  // 		}
  // 	}
  // }));
  // app.set('view engine', 'html');

  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');

  // Load Express Session Module
  session = require('express-session');
  app.use(session({ // Setup Session Middleware

    secret: config.session.secret,
    saveUninitialized: true,
    resave: true
  }));

  // Load Connect Flash Module
  flash = require('connect-flash');
  app.use(flash());
  app.use(function (req, res, next) { // Setup Global Flash Message Middleware

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

  // Load The Bcrypt Module
  bcrypt = require('bcryptjs');

  // Setup Globally Included Directories
  app.use(express.static(path.join(__dirname, '/../bower_components/')));
  app.use(express.static(path.join(__dirname, '/../node_modules/')));
  app.use(express.static(path.join(__dirname, '/../controllers/')));
  app.use(express.static(path.join(__dirname, '/../public/')));

  //Db connection
  
  var sequelize = new Sequelize('testdb', 'root', 'kavi3500', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
  });

  var test = sequelize.authenticate()
    .then(function () {
      console.log("CONNECTED! ");
    })
    .catch(function (err) {
      console.log("SOMETHING DONE GOOFED");
    })
    .done();

  // Load Available Modules For Dependancy Injection Into Models & Routes
  modules = {
    app: app,
    bcrypt: bcrypt,
    bodyParser: bodyParser,
    config: config,
    express: express,
    //expressHandlebars: expressHandlebars,
    flash: flash,
    fs: fs,
    path: path,
    session: session,
    sequelize: sequelize
  };

  // Setup Globally Included Routes
  fs.readdirSync(path.join(__dirname, 'routes')).forEach(function (filename) {

    if (~filename.indexOf('.js'))
      require(path.join(__dirname, 'routes/' + filename))(modules);
  });

  // Start The HTTP Server
  app.listen(config.server.port, config.server.host);
}
