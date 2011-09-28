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
			inputs.bind('keyup', function() {
				var values = [],
						value = parseInt(this.value, 10),
						idx = 0;

				inputs.each(function(i, inp) {
					values.push(parseInt(inp.value, 10))
				});

				idx = values.indexOf(value);
				console.log(values, value, idx);

				if (idx && (value < values[idx - 1])) {
					value = values[idx-1]
				} else if (idx === 0 && (value > values[idx+1])) {
					value = values[idx+1];
				}
				console.log(value);

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
					this.slidePrev(container);
					return false
				}.bind(this));

				$(this.nextBtn, container).bind('click.slider.next', function(event) {
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
			console.log(pos);
			console.log(this.step);
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
			console.log();
			elem.stop(true, false).animate({'left': -position}, 200);
		},

		activate: function() {

		}
	},
	/**
	 * Включаем плавный scrollPlane слайдер для всех элементов описаных в scrollPlaneSelectors
	 */
	activateScrollPlanes: function() {
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

				this.createScrollPlane({container: $(element), target: targetElem, widthIndex: index})
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
	}
};

$(document).ready(function() {
	INP.init();
});