// rmd.init
// Copyright (c) 2008-2023 Greg Greene

// Javascript library for Richmond Masters

// Init globals, common services and features

var SITE_OPT = {
	protocol: window.location.protocol,
	host: window.location.host,
	pathname: window.location.pathname,
	url: '',
	path: '',
	mode: 'normal'
};

SITE_OPT.url = '//' + SITE_OPT.host + '/' + SITE_OPT.path;

//
// init on ready
//
$(document).on('ready', function () {

	$(document).trigger('readyup.before');

	// turn off text and images selectability; to give it that mobile "app" feel.
	if (Hammer) {
		delete Hammer.defaults.cssProps.userSelect;
	}

	if (rmd.userAgent.version().indexOf('11.') == 0) {
		$(document.body).addClass('IE11');
		SITE_OPT.url = '//' + SITE_OPT.host + '/' + SITE_OPT.path;
	}
	else {
		SITE_OPT.url = document.baseURI;
	}

	$(document).trigger('readyup');

	if (rmd.userAgent.isMobile()) {
		$(document.body).addClass('mobile');
	}
	else {
		$(document.body).addClass('not-mobile');
	}

	$(window).on('resize load scroll orientationchange', function () {
		$(document).trigger('updatedimensions');
	});

	$(document).trigger('readyup.after');
});


//
// init jQuery facilitated site services and features
//
(function () {

	(function ($) {
		$.fn.isScrolling = function () {
			return this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false;
		}
	})(jQuery);

	(function ($) {
		$.fn.placeholder = function (s) {
			$(this).attr('placeholder', s);

			$(this).on('focus', function () {
				$(this).attr('placeholder', '');
			});

			$(this).on('blur', function () {
				$(this).attr('placeholder', s);
			});
		}
	})(jQuery);

	(function ($) {
		$.fn.panel = function (params, callback) {
			params = params || {};
			callback = callback || {};

			var _ = $(this),
				_w = $(window),
				panel = null,
				panel_body = null,
				panel_button_close = null,
				id = '',
				mode = 'fixed',
				modal = false,
				modal_bind_this = true,
				bind_to = null,
				panel_found = false,
				show_controls = false,
				width = null,
				height = null;

			if (typeof params.mode != 'undefined')
				mode = params.mode;

			if (typeof params.id != 'undefined')
				id = params.id;

			if (typeof params.modal != 'undefined')
				modal = params.modal;

			if (typeof params.modalBindThis != 'undefined')
				modal_bind_this = params.modalBindThis;

			if (typeof params.bindTo != 'undefined')
				bind_to = $(params.bindTo);

			if (typeof params.showControls != 'undefined')
				show_controls = $(params.showControls);

			if (typeof params.width != 'undefined')
				width = params.width;

			if (typeof params.height != 'undefined')
				height = params.height;

			panel = document.getElementById('site_panel_template_' + id);

			if (!panel) {
				panel = $('#site_panel_template').clone(true, true);
				panel.prop('id') == 'site_panel_template_' + id;

				if (mode == 'dialog') {
					if (show_controls) {
						$('<div class="cover-width-95-percent center text-right cursor-pointer"><div id="site_panel_template_button_close' + id + '" class="bold font-xlg margin-md">X</div></div>').prependTo(_);
						panel_button_close = $('#site_panel_template_button_close' + id);
						panel_button_close.on('click', function () {
							panel.addClass('hide');

							if (modal) {
								bind_to.modal({
									state: 'hide'
								});
							}
						});
					}
					panel_found = true;
				}
			}
			else {
				panel = $(panel);
			}

			//if(panel)
			//return $(panel);

			if (width) {
				panel.css('width', width);
				//alert('set width ' + width);
			}

			if (height) {
				panel.css('height', height);
			}

			if (bind_to) {
				if (modal) {
					bind_to.modal({
						bindThis: modal_bind_this,
						state: 'show'
					});
				}

				// eventCallbacks: {
				// 'click' : function() {
				// $('.layout-body-wrapper').modal('hide');
				// setTimeout(function() {
				// _body.removeClass('view-shift-noscroll-y');
				// _body.removeClass('view-shift-viewport');
				// }, 700);
				// }
				// }

				panel.appendTo(bind_to);
				panel.css('position', 'absolute');
				panel.css('z-index', '1500');

				//DEBUG
				//alert((bind_to.width() / 2) + '-' + (panel.width() / 2) + '(' + width + ')');

				//panel.css('top', rmd.toInt(bind_to.css('top'), 0) + $(document).scrollTop() + 50 + 'px');
				panel.css('top', (bind_to.height() / 2) - (panel.height() / 2) + $(document).scrollTop() - 50 + 'px');
				panel.css('left', ((bind_to.width() / 2) - (panel.width() / 2)) + 'px');
			}
			else {
				panel.appendTo(document.body);

				panel.css('top', (_w.height() / 2) - (panel.height() / 2) + $(document).scrollTop() - 50 + 'px');
				panel.css('left', (_w.width() / 2) - (panel.width() / 2) + 'px');
			}

			panel.prop('id', 'site_panel_template_' + id);

			_.detach();

			panel_body = panel.find('#site_panel_body');
			_.appendTo(panel_body);

			if (mode == 'dialog') {
				panel.addClass('release');
			}

			panel.removeClass('hide');
			_.removeClass('hide');

			if (typeof callback.success == 'function')
				callback.success(panel);

			return panel;
		}
	})(jQuery);

	(function ($) {
		$.fn.modal = function (state_param) {
			var params = {},
				overlay = null,
				zindex = parseInt($(this).css('z-index')),
				body = $(document.body);

			if (!document.getElementById('site_overlay'))
				body.append('<div id=\'site_overlay\' class=\'ui-widget-overlay hide\'></div>');

			overlay = $('#site_overlay');

			if (Hammer) {
				rmd.app.refs.hammertime['overlay'] = new Hammer(overlay.get(0));
				rmd.app.refs.hammertime['overlay'].get('swipe').set({ direction: Hammer.DIRECTION_UP });
				rmd.app.refs.hammertime['overlay'].on('swipe', function (e) {

					if (!rmd.userAgent.isMobile())
						return;

					if (e.direction == Hammer.DIRECTION_UP) {
						if (body.hasClass('view-shift-top') || body.hasClass('view-map')) {
							rmd.app.closeFlex();
						}
					}
				});
			}

			if (typeof state_param == 'object')
				params = state_param;
			else
				state = state_param;

			zindex = !isNaN(zindex) ? zindex - 1 : "1000";

			overlay.css('z-index', zindex)

			if (params.state) {
				state = params.state;
			}

			if (params.bindThis) {
				overlay = overlay.detach();
				overlay.appendTo(this);
				overlay.css('position', 'absolute');
			}
			else {
				overlay = overlay.detach();
				overlay.appendTo(document.body);
				overlay.css('position', 'fixed');
			}

			if (params.eventCallbacks) {
				for (var event_name in params.eventCallbacks) {
					if (typeof params.eventCallbacks[event_name] == 'function') {
						overlay.on(event_name, params.eventCallbacks[event_name]);
					}
				}
			}

			if (state == 'hide')
				overlay.addClass('hide');
			else if (state == 'show')
				overlay.removeClass('hide');

			return overlay;
		}
	})(jQuery);
}
)();
