INP = {
	// Параметры для слайдера выбора цены
	sliderPrice: {
		selector: '.price-slider',
		range: true,
		min: 0,
		max: 100000,
		labels: true
	},

	//	В массиве перечи
	scrollPlane: {
		elements: ['.track-list-container'],
		width: {}
	},

	init: function() {
		this.activateScrollPlanes();
		this.ManualScroll.init();
		this.Sliders.init(this.sliderPrice);
		this.globalListeners();
		this.Accordion.init();
	},

	Sliders: {
		init: function(options) {
			var inputs = $(options.selector + '-inputs input'),
					min = inputs.filter('.min-arm'),
					max = inputs.filter('.max-arm');

			options.slide = options.slide || function(e, ui) {
				if (ui.value == ui.values[0]) {
					/*left max*/
					min.val(ui.value);
				} else {
					/*right max*/
					max.val(ui.value);
				}
			};

			options.values = options.values || [min.val(), max.val()];
			options.labels && this.renderLabels(options);

			var instance = $(options.selector).slider(options);
			this.manualChange(inputs, instance);
		},

		manualChange: function(inputs, slider) {
			var min = slider.slider('option', 'min'),
					max = slider.slider('option', 'max');

			inputs.bind('keyup', function() {
				var values = [],
						value = parseInt(this.value, 10),
						idx = 0;

				inputs.each(function(i, inp) {
					values.push(parseInt(inp.value, 10))
				});

				idx = values.indexOf(value);

				if (idx) {
					if (value < values[idx-1]) {
						value = values[idx-1]
					}

					if (value < min) {
						value = min;
					}
				} else {
					if (value > values[idx+1]) {
						value = values[idx+1]
					}

					if (value > max) {
						value = max;
					}
				}

				slider.slider('values', idx, value)
			});
		},

		renderLabels: function(opt) {
			var labels = this.createLabels(opt, 'min', 'max');
			$(opt.selector).append(labels);
		},

		createLabels: function() {
			var labels = '',
					key = '';

			for (var i=1; i < arguments.length; i++) {
				key = arguments[i];
				labels += '<div class="label label-'+ key +'">'+ arguments[0][key] + '</div>';
			}

			return labels;
		}
	},

	Accordion: {
		init: function() {
			var lis = $( ".accordion > li" ),
					count = lis.length,
					fullWidth = $( '.accordion' ).width();

			var av = 0;
			for (var i = 0; i < count; i++) {
				lis[i].style.left = Math.floor(av) + 'px';
				av += fullWidth / count;
			}

			$( ".accordion > li" ).click( function() {
				var $active = $( ".accordion > li.active" ),
						$active2 = $(this),
						active2 = $active2.get(0);

				if ( active2 == $active.get(0) ) {
					return false
				}

				if ($active.length) {
					$active.find('.content').fadeOut();
				}

				$active2.find('.content').fadeIn();

				var newActiveWidth = $active2.width(),
						activeCurrWidth = $active.width(),
						oldAvgWidth = (fullWidth - activeCurrWidth) / (count - 1),
						avgWidth = (fullWidth - newActiveWidth) / (count - 1);

				var t = 0;
				(function frame() {
					t++;
					var progress = t / 8;
					var dx = 0;
					var avgDx = (avgWidth - oldAvgWidth) * progress + oldAvgWidth;
					for ( var i = 0; i < count; i++ ) {
						if ( i ) {
							lis[i].style.left = Math.floor( dx ) + 'px';
						}
						if ( lis[i] == active2 ) {
							dx += (newActiveWidth - oldAvgWidth) * progress + oldAvgWidth;
							continue;
						}
						if ( lis[i] == $active.get( 0 ) ) {
							dx += (avgWidth - activeCurrWidth) * progress + activeCurrWidth;
							continue;
						}
						dx += avgDx;
					}
					if ( t < 8 ) setTimeout( frame , 30 );
				})();
				$active.removeClass( "active" );
				$active2.addClass( "active" );
				return false;
			} );
		}
	},

	ManualScroll: {
		elements: '.product-track',
		prevBtn: '.controls .left',
		nextBtn: '.controls .right',
		container: '.track-list',
		step: null,

		init: function() {
			this.step = $(this.container).find('li').eq(0).outerWidth();
			this.setListeners();
		},

		setListeners: function() {

			$(this.elements).each(function(i, elem) {
				var container = $(elem);

				$(this.prevBtn, container).bind('click.slider.prev', function(event) {
					event.preventDefault();
					this.slidePrev(container);
					return false
				}.bind(this));

				$(this.nextBtn, container).bind('click.slider.next', function(event) {
					event.preventDefault();
					this.slideNext(container);
					return false
				}.bind(this));
			}.bind(this));
		},

		slidePrev: function(container) {
			var elem = $(this.container, container),
					pos = -parseInt(elem.css('left'), 10),
					step = (isNaN(pos) ? 0 : pos) - this.step,
					newPos = (step > 0) ? step : 0;
			this.moveTo(elem, newPos);
		},

		slideNext: function(container) {
			var elem = $(this.container, container),
					max = elem.width() - container.width(),
					pos = -parseInt(elem.css('left'), 10),
					step = (isNaN(pos) ? 0 : pos) + this.step,
					newPos = (step > max) ? max : step;

			this.moveTo(elem, newPos);
		},

		moveTo: function(elem, position) {
			elem.stop(true, false).animate({'left': -position}, 200);
		}

	},
	/**
	 * Включаем плавный scrollPlane слайдер для всех элементов описаных в scrollPlaneSelectors
	 */
	activateScrollPlanes: function(update) {
		for (var i=0; i < this.scrollPlane.elements.length; i++) {
			var container = this.scrollPlane.elements[i],
					target = container.split('-container');

			$(container).each(function(key, element) {
				var targetElem = $(target[0], $(element)),
						index = i + '' + key;

				this.scrollPlane.width[index] = {
					container: $(element).width(),
					target: $(targetElem).width()
				};

				!update && this.createScrollPlane({container: $(element), target: targetElem, widthIndex: index});

			}.bind(this));
		}
	},

	createScrollPlane: function(params) {
		var container = params.container,
				target = params.target,
				idx = params.widthIndex,
				_inp = this;

		var bindMouseMove = function() {
			container.bind('mousemove.scroll_plane', _.throttle(function(event) {
				var width = _inp.scrollPlane.width[idx].container,
					blockPos = Math.round(((event.clientX - container.offset().left) * 100) / width),
					widthDiff = _inp.scrollPlane.width[idx].target - width,
					shift = (blockPos * widthDiff) / 100;

				target.css('left', -shift);
			},10));
		}.bind(this);

		if (target.width() > container.width()) {
			bindMouseMove();

			container.bind('mouseenter', function(event) {
				var delta = 10,
						width = _inp.scrollPlane.width[idx].container,
						blockPos = Math.round(((event.clientX - container.offset().left) * 100) / width),
						widthDiff = _inp.scrollPlane.width[idx].target - width,
						shift = (blockPos * widthDiff) / 100,
						enter = -parseInt(target.css('left'), 10);

				enter = isNaN(enter) ? 0 : enter;

				/* Если точка вхождения находится дальше чем css:left + delta , делаем плавную прокрутку */
				if ( (enter < shift) && (enter + delta < shift)  ||  ( (enter > shift) && (enter - delta > shift) ) ) {
					container.unbind('mousemove.scroll_plane');
					target.stop(true, false).animate({
						left: -shift
					}, 300, function() {
						bindMouseMove();
					});
				}
			});
		}
	},

	globalListeners: function() {
		$(window).resize(_.debounce(function() {
			this.activateScrollPlanes(true);
		}.bind(this) , 500));
	}

};

$(document).ready(function() {
	INP.init();
});