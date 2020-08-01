const access = {
	restrict: function(req, res, next){
		if(req.session.user){
			next();
		} else{
			res.redirect('/login');
		}
	},
	loginSignupPageRestrict:function(req, res, next){
		if(!req.session.user){
			next();
		} else{
			res.redirect('/')
		}
	}
}

module.exports = access;