rmd.app = {};
rmd.app.animate = {};
rmd.app.readyUpQueue = [];
rmd.app.refs = {};

rmd.app.addReadyUp = function (f) {
    rmd.app.readyUpQueue[rmd.app.readyUpQueue.length] = {
        f: f
    };
    return f;
};

rmd.app.search = function (params) {
	$(document).trigger('search', params);
};

rmd.app.themeize = function (el, type) {
	var _el = $(el);

	type = rmd.isEmpty(type) ? '' : type;

	_el.addClass('rmd-theme-' + type.toLowerCase());
};

rmd.app.unthemeize = function (el) {
	var _el = $(el);

	type = rmd.isEmpty(type) ? '' : type;

	_el.removeClass(function (index, className) {
		return (className.match(/(^|\s)rmd-theme-\S+/g) || []).join(' ');
	});
};

rmd.app.setState = function (params) {
	var state = '',
		body = $(document.body);

	params = params || {};

	if (params.state) {
		state = params.state;
	}

	if (state == 'LOADING') {
		body.addClass('app-state-loading');
		body.addClass('loading');
		body.modal('show');
	}
	else if (state == 'ARTICLE_CREATING') {
		body.addClass('app-state-article-creating');
		body.addClass('loading');
		body.modal('show');
	}
	else if (state == 'ARTICLE_UPDATING') {
		body.addClass('app-state-article-updating');
		body.addClass('loading');
		body.modal('show');
	}
	else if (state == 'ARTICLE_DELETING') {
		body.addClass('app-state-article-deleting');
		body.addClass('loading');
		body.modal('show');
	}
	else if (!state || state == '' || state == 'NORMAL') {
		body.removeClass('app-state-loading');
		body.removeClass('app-state-article-creating');
		body.removeClass('app-state-article-updating');
		body.removeClass('loading');
		body.modal('hide');
    }
};

rmd.app.setShift = function (params) {
	var e = null, 
		side = 'left', 
		body = $(document.body);
	
	params = params || {};
	
	if(body.hasClass('view-shift-left') || body.hasClass('view-shift-right') || body.hasClass('view-shift-top') || body.hasClass('view-map')) {
		rmd.app.closeShift();
		return;
	}
	
	if(params.side) {
		side = params.side;
	}
	
	if(params.e) {
		console.debug(JSON.stringify(params));
		
		e = $(params.e);
		e.detach();
		e.appendTo('.layout-shift-body-' + side + '-content-container');
		e.removeClass('hide');
		
		$(document).on('shift.' + side + '.close', function() {
			e.addClass('hide');
		});
	}
	
	body.addClass('view-shift-noscroll-y');
	body.addClass('view-shift-viewport');
	body.addClass('view-shift-' + side);
	
	$(document).trigger('shift.' + side + '.afterset');
		
	return e ? $(e) : null;
};


rmd.app.closeShift = function() {
	var body = $(document.body);
	body.removeClass('view-shift-top');
	body.removeClass('view-shift-left');
	body.removeClass('view-shift-right');
	
	setTimeout(function() {
		body.removeClass('view-shift-noscroll-y');
		body.removeClass('view-shift-viewport');
	}, 700);
	
	//$('.layout-shift-body-left-content-container').empty();
	//$('.layout-shift-body-right-content-container').empty();
	
	$(document).trigger('shift.top.close');
	$(document).trigger('shift.left.close');
	$(document).trigger('shift.right.close');
};

$(document).on('ready', function() {
	// $(document).bind('shift.set', function(e, detail) {
	// });
	
	// $(document).bind('shift.close', function(e, detail) {
	// });
	
	// $(document).bind('shift.afterset', function(e, detail) {
	// });

	for (var i = 0; i < rmd.app.readyUpQueue.length; i++) {
		var readyup = rmd.app.readyUpQueue[i];
		if (typeof readyup.f != 'function')
			continue;
		readyup.f();
	}

	if (!Hammer) {
		return;
    }

	rmd.app.refs.hammertime = {};
	rmd.app.refs.hammertime['body'] = new Hammer(document.body);
	rmd.app.refs.hammertime['body'].on('swipe', function(e) {
		
		if(!rmd.userAgent.isMobile())
			return;
		
		var body = $(document.body);
		if(e.direction == Hammer.DIRECTION_LEFT) {
			if(body.hasClass('view-shift-left')) {
				body.removeClass('view-shift-left');
				setTimeout(function() {
					body.removeClass('view-shift-noscroll-y');
					body.removeClass('view-shift-viewport');
				}, 700);
			}
			else {
				rmd.app.setShift({ side:'right' });
			}
		}
		else if (e.direction == Hammer.DIRECTION_RIGHT) {
			if(body.hasClass('view-shift-right')) {
				body.removeClass('view-shift-right');
				setTimeout(function() {
					body.removeClass('view-shift-noscroll-y');
					body.removeClass('view-shift-viewport');
				}, 700);
			}
			else {
				//rmd.app.setShift({side:'left'});
			}
		}
		else if (e.direction == Hammer.DIRECTION_UP) {
			if(body.hasClass('view-shift-top')) {
				body.removeClass('view-shift-top');
				body.removeClass('view-map');
				setTimeout(function() {
					body.removeClass('view-shift-noscroll-y');
					body.removeClass('view-shift-viewport');
				}, 700);
			}
		}
	});
});

rmd.app.animate.onOff = function(ids, animation_id) {
	$(ids).removeClass(animation_id);
			
	setTimeout(function() {
		$(ids).addClass(animation_id);
	}, 250);
};



