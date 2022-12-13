// rmd.app, Thu Jun 28 12:00:00 -0500 2008 / Tue Nov 13 10:00:00 -0500 2018
// Copyright (c) 2008-2018 Greg Greene

// Javascript library for Richmond Masters

// Common app services and features

rmd.app = {};
rmd.app.session = {};
rmd.app.session.current = {};
rmd.app.animate = {};
rmd.app.refs = {};

rmd.app.search = function (params) {
	$(document).trigger('search', params);
};

rmd.app.themeize = function (params) {
	params = params || {};

	var _el = $(params.element),
		id = typeof params.id == 'undefined' ? '' : params.id,
		type = typeof params.type == 'undefined' ? '' : params.type;

	_el.addClass(id + '-theme-' + type.toLowerCase());
};

rmd.app.unthemeize = function (params) {
	params = params || {};

	var _el = $(params.element),
		id = typeof params.id == 'undefined' ? '' : params.id,
		type = typeof params.type == 'undefined' ? '' : params.type;

	_el.removeClass(function (index, className) {
		return (className.match('(^|\s)' + id + '-theme-\S+') || []).join(' ');
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

	$(document).trigger('setstate', params);
};

rmd.app.setShift = function (params) {
	var e = null, 
		side = 'left', 
		body = $(document.body);
	
	params = params || {};
	
	if(body.hasClass('mode--layout-shift-left') || body.hasClass('mode--layout-shift-right') || body.hasClass('mode--layout-shift-top') || body.hasClass('mode--map')) {
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
		e.appendTo('.site-layout-shift > div[style*="grid-area:' + side + '"]');
		e.removeClass('hide');
		
		$(document).on('layout.shift.' + side + '.close', function() {
			e.addClass('hide');
		});
	}
	
	body.addClass('mode--noscroll-y');
	//body.addClass('mode--viewport');
	body.addClass('mode--layout-shift-' + side);
	
	$(document).trigger('layout.shift.' + side + '.afterset');
		
	return e ? $(e) : null;
};


rmd.app.closeShift = function() {
	var body = $(document.body);
	body.removeClass('mode--layout-shift-top');
	body.removeClass('mode--layout-shift-left');
	body.removeClass('mode--layout-shift-right');
	
	setTimeout(function() {
		body.removeClass('mode--noscroll-y');
		//body.removeClass('mode--viewport');
	}, 700);
	
	//$('.layout-shift-body-left-content-container').empty();
	//$('.layout-shift-body-right-content-container').empty();
	
	$(document).trigger('layout.shift.top.close');
	$(document).trigger('layout.shift.left.close');
	$(document).trigger('layout.shift.right.close');
};

$(document).on('ready', function() {
	// $(document).bind('layout.shift.set', function(e, detail) {
	// });
	
	// $(document).bind('layout.shift.close', function(e, detail) {
	// });
	
	// $(document).bind('layout.shift.afterset', function(e, detail) {
	// });

	if (Hammer) {

		rmd.app.refs.hammertime = {};
		rmd.app.refs.hammertime['body'] = new Hammer(document.body);
		rmd.app.refs.hammertime['body'].on('swipe', function (e) {

			if (!rmd.userAgent.isMobile())
				return;

			var body = $(document.body);
			if (e.direction == Hammer.DIRECTION_LEFT) {
				if (body.hasClass('mode--layout-shift-left')) {
					body.removeClass('mode--layout-shift-left');
					setTimeout(function () {
						body.removeClass('mode--layout-shift-noscroll-y');
						body.removeClass('mode--layout-shift-viewport');
					}, 700);
				}
				else {
					rmd.app.setShift({ side: 'right' });
				}
			}
			else if (e.direction == Hammer.DIRECTION_RIGHT) {
				if (body.hasClass('mode--layout-shift-right')) {
					body.removeClass('mode--layout-shift-right');
					setTimeout(function () {
						body.removeClass('mode--layout-shift-noscroll-y');
						body.removeClass('mode--layout-shift-viewport');
					}, 700);
				}
				else {
					//rmd.app.setShift({side:'left'});
				}
			}
			else if (e.direction == Hammer.DIRECTION_UP) {
				if (body.hasClass('mode--layout-shift-top')) {
					body.removeClass('mode--layout-shift-top');
					body.removeClass('mode--layout-shift-map');
					setTimeout(function () {
						body.removeClass('mode--layout-shift-noscroll-y');
						body.removeClass('mode--layout-shift-viewport');
					}, 700);
				}
			}
		});
	}
});

rmd.app.animate.onOff = function(ids, animation_id) {
	$(ids).removeClass(animation_id);
			
	setTimeout(function() {
		$(ids).addClass(animation_id);
	}, 250);
};

rmd.app.dialog = function (e, f_ok, f_cancel) {

	var dialog = $(e).dialog({
		id: "rmd_dialog_" + rmd.random('ccccccccccc'),
		autoOpen: false,
		width: 390,
		height: 225,
		modal: true,
		dialogClass: 'ui-dialog-notitlebar',
		buttons: [{
			id: "rmd_dialog_ok",
			text: "OK",
			click: function () {
				if (typeof (f_ok) == "function") {
					f_ok(this);
				}
				else {
					dialog.dialog("close");
				}
			}
		},
		{
			id: "rmd_dialog_cancel",
			text: "Cancel",
			click: function () {
				if (typeof (f_cancel) == "function") {
					f_cancel(this);
				}
				else {
					dialog.dialog("close");
				}
			}
		}],
		close: function () {

		}
	});

	return dialog;
};

rmd.app.dialogOk = function (e, f_ok, f_cancel) {
	var d = rmd.qa.dialog(e, f_ok, f_cancel);

	buttons = d.dialog("option", "buttons");
	buttons.splice(1, 1);
	d.dialog("option", "buttons", buttons);

	return d;
};

rmd.app.showAbout = function () {
	var _w = $(window),
		_body = $(document.body),
		about = $('#site_about'),
		object = $('#site_about_body_content_object'),
		panel = null,
		callback_click = null,
		background_color = '#fff',
		svg = '',
		svg_data_path = object.attr('data');


	if (_body.hasClass('IE11')) {
		//svg = rmd.fetchContent(object.attr('data'));
		//console.debug(svg);
		//object.html('');
		//object.attr('data', object.attr('data'));
		//setTimeout(function() {
		//	object.html(svg);
		//}, 1000);

		object.attr('data', '');
		object.html('');

		setTimeout(function () {
			object.attr('data', svg_data_path);
		}, 100);
	}
	else {

	}

	about.removeClass('hide');
	panel = about.panel({ id: 'about', mode: 'dialog' });

	panel.css('max-width', '375px');
	panel.addClass('shadowed');
	panel.removeClass('hide');

	_w.on('resize scroll', function () {
		panel.css('top', (_w.height() / 2) - (panel.height() / 2) + $(document).scrollTop() - 75 + 'px');
		panel.css('left', (_w.width() / 2) - (panel.width() / 2) + 'px');
	});

	_w.trigger('resize');

	callback_click = function (e) {
		e.stopPropagation();
		about.addClass('hide');
		panel.modal('hide');
		panel.addClass('hide');
		$('#site_overlay').css('background-color', background_color);
		about.detach().appendTo(_body);
		panel.remove();
	};

	panel.modal({
		state: 'show',
		bindTo: false,
		eventCallbacks: {
			'click': callback_click
		}
	});

	background_color = $('#site_overlay').css('background-color');
	$('#site_overlay').css('background-color', '#555');

	object.on('click', callback_click);
	panel.on('click', callback_click);
	$('#site_about_body_content').on('click', callback_click);

	//rmd.app.closeFlex();

	return panel;
};

rmd.app.notifyTape = function (message) {
	var p = $('#site_notifier_tape');

	p.removeClass('active');
	p.removeClass('hide');
	p.css('z-index', '2000');

	setTimeout(function () {
		p.css('top', $(document).scrollTop() + 'px');
		//p.css('top', '0px');
		p.css('left', '0px');
	}, 500);

	if (message) {
		$('#site_notifier_tape .message').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	setTimeout(function () {
		p.css('top', '-90px');
		//p.addClass('anim-fadeout active');

		setTimeout(function () {
			//p.removeClass('anim-fadeout active');
			p.addClass('hide');
		}, 1000);
	}, 3500);

	return p;
};

rmd.app.closeNotifyTape = function () {
	var p = $('#site_notifier_tape');
	p.addClass('hide');
	return p;
};

rmd.app.notifyBadge = function (message) {
	var p = $('#site_notifier_badge');
	var w = $(window);

	p.removeClass('active');
	p.removeClass('hide');

	p.modal('show');

	//p.css('top', $(document).scrollTop() + 'px');
	p.css('top', (w.height() / 2) - (p.height() / 2) + $(document).scrollTop() - 50 + 'px');
	p.css('left', (w.width() / 2) - (p.width() / 2) + 'px');

	if (message) {
		$('#site_notifier_badge .site-notifier-badge-content').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	return p;
};

rmd.app.notifyBadgeOk = function (message) {
	var p = $('#site_notifier_badge_ok');
	var w = $(window);

	p.removeClass('active');
	p.removeClass('hide');

	p.modal('show');

	//p.css('top', $(document).scrollTop() + 'px');
	p.css('top', (w.height() / 2) - (p.height() / 2) + $(document).scrollTop() - 50 + 'px');
	p.css('left', (w.width() / 2) - (p.width() / 2) + 'px');

	if (message) {
		$('#site_notifier_badge_ok .site-notifier-badge-content').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	setTimeout(function () {
		p.modal('hide');
	}, 2000);

	return p;
};

rmd.app.balloon = function (message, target, at, f_ok, f_cancel) {
	var balloon = $("#site_balloon").clone();
	balloon.attr('id', 'site_balloon_' + rmd.random('hhhhhhhh'));
	balloon.removeClass("hide");

	var d = rmd.qa.dialog(balloon, f_ok, f_cancel);
	var t = $(target);

	d.dialog("option", {
		buttons: null,
		width: 250,
		height: 85,
		modal: false,
		resizable: false,
		dialogClass: 'ui-dialog-notitlebar ui-dialog-nopadding site-dialog-balloon ui-dialog-noshadow noborder',
		position: { my: "top-7px", at: "center bottom", of: t }
	});

	var content = balloon.find('.content');
	content.text(message);

	var gotit = content.prepend("<div class='show-table site-closex cursor-pointer font-lg cover-width'>&nbsp;X&nbsp;</div>");
	gotit.on('click', function () {
		d.dialog('destroy');
	});

	d.dialog("open");

	$(window).on('resize scroll', function () {
		if (d) {
			d.dialog("option", {
				position: { my: "top-5px", at: "bottom", of: t }
			});
		}
	});

	balloon.addClass("active");

	//d.prepend("<img class='nav-menu-arrow' src='../images/icon-arrow-up-40x16.svg' />");

	//d.css("left", t.position().left);
	//d.css("top", t.position().top);

	return d;
};

rmd.app.session.current = {
	authenticated: false,
	timeoutIn: -1,
	timeoutIds: {
		affirm: -1,
		autoLogout: -1
	},
	callbacks: {
		affirm: {},
		reset: {}
	}
};

rmd.app.session.reset = function() {
	clearTimeout(rmd.app.session.current.timeoutIds['autoLogout']);
	clearTimeout(rmd.app.session.current.timeoutIds['affirm']);

	rmd.app.session.affirm();
};


rmd.app.session.affirm = function(params, callbacks) {

	params = params || {};

	callbacks = callbacks || rmd.app.session.current.callbacks['affirm'] || {};

	rmd.app.session.current.callbacks['affirm'] = callbacks;
	
	if (rmd.app.session.current.authenticated) {
		var timeout_minutes = rmd.app.session.current.timeoutIn,
			timeout_milliseconds = !isNaN(parseInt(timeout_minutes)) ? parseInt(timeout_minutes) * 60 * 1000 : 30 * 60 * 1000,
			timeout_left_milliseconds = (timeout_milliseconds * 0.25),
			f = function () {

				rmd.app.session.current.timeoutIds['affirm'] = setTimeout(function () {
					var time_type = (timeout_left_milliseconds / 1000) < 60 ? 'second' : 'minute',
						time_left = (timeout_left_milliseconds / 1000) < 60 ? timeout_left_milliseconds / 1000 : Math.round(timeout_left_milliseconds / 1000 / 60),
						then = Date.now();

						rmd.app.session.current.timeoutIds['autoLogout'] = setTimeout(function () {
							if('logout' in callbacks) {
								callbacks.logout();
							}
						}, timeout_left_milliseconds);


					// TODO: replace with custom dialog
					if (confirm('Your session is going to expire in about ' + time_left + '(s) ' + time_type + '. Do you wish to stay logged in?')) {
						if (Math.floor((Date.now() - then) / 1000 / (time_type == 'minute' ? 60 : 1)) > time_left) {
							if('logoutWaited' in callbacks) {
								callbacks.logoutWaited();
							}
						}
						else {
							if('sessionReset' in callbacks) {
								callbacks.sessionReset();
							}
							f();
						}
					}
					else {
						if('logoutOk' in callbacks) {
							callbacks.logoutOk();
						}
					}

					clearTimeout(rmd.app.session.current.timeoutIds['autoLogout']);

				}, timeout_left_milliseconds * 0.75);
			};

		f();
	}
	
	
};
