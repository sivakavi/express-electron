module.exports = function() {

	app.get('/', function(req, res) {
		res.render('pages/home',{ "title": "Login"});
	});

	app.get('/test', function(req, res) {
		res.render('pages/test');
	});
}
