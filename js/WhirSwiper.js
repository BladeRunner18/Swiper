



//基于jquery  在此插件之前要引入jquery
//作者 '万户 / Whir'





(function (global, $, factory) {


    global.WhirSwiper = factory();

    //二级菜单切换函数
    function pullNav(root,triggerEl){
        var trigger;
        root.children('li').each(function(index,element){
            var $el = $(element);
            if($el.children('ul').length !== 0 ){
                var arrow = $('<i class =\'arrow\'></i>').appendTo($el);
                triggerEl ? trigger = triggerEl : trigger = '.arrow';
                $el.children(trigger).on('click',function(){
                    $(this).parent().children('ul').slideToggle();
                    $(this).parent().siblings().children('ul').slideUp();
                    $(this).parent().toggleClass('on');
                    $(this).parent().siblings().removeClass('on');
                })
                $.pullNav($el.children('ul'),triggerEl);
            }
        }) 
    }

    function tabChange (el,cont,trigger) {
        $(el).eq(0).addClass('on');
        $(cont).hide().eq(0).show();
        $(el).on(trigger,function(){
            if(!($(this).hasClass('on'))){
                $(this).addClass('on').siblings().removeClass('on');
                var index = $(this).index();
                $(cont).hide().eq(index).fadeIn();
            }
        })
    }

    $.pullNav = pullNav;
    $.tabChange = tabChange;
 

})(window, jQuery, function () {

    'use strict';

    var vision = '1.0';

    var Author = '万户 / Whir';

    var defaultOptions = {
        slidesPerView: 1,
        spaceBetween: 0,
        initIndex: '',
        loop: false,
        autoplay: null,
        speed: 500,
        navigation: null,
        pagination: null,
        breakPoints: {},
        drag: true,
        touch: true,
        responsive: true,
        useData: false,
        play: true,
        thumb: null,
    }

    function getBreakPoints() {
        var swiper = this;
        if (swiper.params.useData) {
            var nodeAttr = swiper.$el.find('.whir-wrapper').get(0).attributes;
            var data = {};
            var reg = /^[0-9]*$/;
            [].slice.call(nodeAttr).forEach(function (node) {
                var attrName = node.name;
                if (attrName.indexOf('whir') === 0) {
                    var exp = attrName.substring(5);
                    data[exp] = {};
                    if (exp == 'play') { node.value === 'false' ? swiper.params.play = false : swiper.params.play = true }
                    if (exp == 'drag') { node.value === 'false' ? swiper.params.drag = false : swiper.params.drag = true }
                    if (exp == 'loop') { node.value === 'false' ? swiper.params.drag = false : swiper.params.drag = true }
                    if (exp == 'pagination') { swiper.params.pagination.el=node.value }
                    if (exp == 'navigation') { swiper.params.navigation.prevEl=node.value.split(',')[0]; swiper.params.navigation.nextEl = node.value.split(',')[1];}
                    if (reg.test(exp)) {
                        data[exp].slidesPerView = parseInt(node.value.split(',')[0]);
                        data[exp].spaceBetween = parseInt(node.value.split(',')[1]);
                    }
                }
            })
            swiper.params.breakPoints = data;
        } else {
            swiper.params.breakPoints['1920'] = {};
            swiper.params.breakPoints['1920'].slidesPerView = swiper.params.slidesPerView;
            swiper.params.breakPoints['1920'].spaceBetween = swiper.params.spaceBetween;
        }
        return swiper.params.breakPoints;
    }

    function setParams() {
        var swiper = this;
        swiper.slides = swiper.$el.find('.whir-slide');
        swiper.wrapper = swiper.$el.find('.whir-wrapper');
        if (swiper.params.play) {
            swiper.dir = '';
            swiper.realIndex = 0;
            swiper.checkBrowser();
            swiper.realSlides = swiper.wrapper.find('.whir-slide').length;
            swiper.isAnimating = false;
            swiper.addClass();
            swiper.params.initIndex != '' ? swiper.index = swiper.params.initIndex : swiper.index = 0;
            swiper.params.loop && swiper.loopCreate();
        }
        swiper.responsiveFn();
    }

    function checkBrowser() {
        var swiper = this,
            translate3D = "translate3d(0px, 0px, 0px)",
            tempElem = document.createElement("div"),
            regex,
            asSupport,
            support3d,
            isTouch;

        tempElem.style.cssText = "  -moz-transform:" + translate3D +
            "; -ms-transform:" + translate3D +
            "; -o-transform:" + translate3D +
            "; -webkit-transform:" + translate3D +
            "; transform:" + translate3D;
        regex = /translate3d\(0px, 0px, 0px\)/g;
        asSupport = tempElem.style.cssText.match(regex);
        support3d = (asSupport !== null && asSupport.length === 1);

        isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }

        swiper.isPC = flag;
        swiper.support3d = support3d;
        swiper.supportTouch = isTouch;
    }

    function changeTransition(time) {
        var swiper = this;
        var transition = {
            "transition-duration": time + "ms",
            "-moz-transition-duration": time + "ms",
            "-webkit-transition-duration": time + "ms",
            "-o-transition-duration": time + "ms",
        }
        swiper.wrapper.css(transition);
        return swiper;
    }

    function addClass() {
        var swiper = this;
        for (var i = 0; i < swiper.slides.length; i++) {
            $(swiper.slides[i]).attr('whir-slide-index',i);
        }
    }

    function loopCreate() {
        var swiper = this;
        var params = swiper.params;
        if (params.slidesPerView === 1) {
            swiper.wrapper.prepend($(swiper.slides[swiper.slides.length - 1]).clone(true).addClass('whir-slide-duplicate'));
            swiper.wrapper.append($(swiper.slides[0]).clone(true).addClass('whir-slide-duplicate'));
            swiper.slides = swiper.$el.find('.whir-slide');
            swiper.index = 1;
        }
        else {
            for (var i = 0; i < params.slidesPerView - 1; i++) {
                swiper.wrapper.prepend($(swiper.slides[swiper.slides.length - 1 - i]).clone(true).addClass('whir-slide-duplicate'));
                swiper.wrapper.append($(swiper.slides[i]).clone(true).addClass('whir-slide-duplicate'));
            }
            swiper.slides = swiper.$el.find('.whir-slide');
            swiper.index = swiper.params.slidesPerView - 1;
        }
    }

    function responsiveFn() {
        var swiper = this;
        var points = swiper.params.breakPoints;
        var width = $(window).width();
        var num, space, outerWidth;
        var index = swiper.index;
        outerWidth = swiper.$el.width();
        if (outerWidth != swiper.width) {
            var sortPoints = Object.keys(points).sort(function (a, b) {
                return b - a;
            })
            for (var i = 0; i < sortPoints.length; i++) {
                if (width <= sortPoints[i]) {
                    num = points[sortPoints[i]].slidesPerView;
                    space = points[sortPoints[i]].spaceBetween;
                }
            }
            swiper.width = outerWidth;
            swiper.params.slidesPerView = num;
            swiper.params.spaceBetween = space;
            swiper.upDateSlide(outerWidth, num, space)
            swiper.params.play && swiper.slideTo(index);
        }

    }

    function upDateSlide(outerWidth, num, space) {
        var swiper = this;
        var width = (outerWidth - (space * (num - 1))) / num;
        swiper.singleWidth = width;
        swiper.slides.css({
            width: width + 'px',
            marginRight: space + 'px',
        })
        $(swiper.slides[swiper.slides.length - 1]).css('margin-right', '0px');
        if (swiper.params.play) {
            var totalWidth = (swiper.slides.length * swiper.singleWidth) + ((swiper.slides.length - 1) * space) + 20;
            swiper.wrapper.css('width', totalWidth + 'px');
            swiper.getSlideGrid();
        }
        else {
            swiper.wrapper.css('flex-wrap', 'wrap');
            var i = num;
            while (i <= swiper.slides.length) {
                $(swiper.slides[i - 1]).css({ marginRight: '0px' });
                i += num;
            }
        }
    }

    function getSlideGrid() {
        var swiper = this;
        var arr = [];
        for (var i = 0; i <= swiper.slides.length - swiper.params.slidesPerView; i++) {
            arr[i] = (i * swiper.singleWidth) + (i * swiper.params.spaceBetween);
        }
        swiper.slideGrid = arr;
        swiper.maxSlide = swiper.slideGrid.length - 1;
    }


    function upDateClass() {
        var swiper = this;
        var index = swiper.index;
        swiper.pagination != undefined && swiper.pagination.els.forEach(function (el) { $(el).removeClass('whir-pagination-active'); })
        swiper.slides.removeClass('whir-slide-active whir-slide-prev whir-slide-next');
        if (swiper.params.loop) {
            var realIndex = swiper.wrapper.find('.whir-slide').eq(index).attr('whir-slide-index');
            swiper.pagination != undefined && swiper.pagination.els[realIndex].addClass('whir-pagination-active');
            swiper.wrapper.find('.whir-slide').eq(index).addClass('whir-slide-active').prev().addClass('whir-slide-prev');
            swiper.wrapper.find('.whir-slide').eq(index).addClass('whir-slide-active').next().addClass('whir-slide-next');
        } else {
            swiper.pagination != undefined && swiper.pagination.els[index].addClass('whir-pagination-active')
            swiper.wrapper.find('.whir-slide-index-' + realIndex + ':not(.whir-slide-duplicate)').addClass('whir-slide-active').prev().addClass('whir-slide-prev');
            swiper.wrapper.find('.whir-slide-index-' + realIndex + ':not(.whir-slide-duplicate)').next().addClass('whir-slide-next');        }
    }
 
    function drag() {
        var swiper = this, isDown = false, x, y, newx, translate, index,direction='';
        swiper.wrapper.on('mousedown', function (event) {
            if (swiper.isAnimating) { return false }
            event = event || window.event;
            event.preventDefault();
            x = event.clientX;
            y = event.clientY;
            isDown = true;
            swiper.changeTransition(0);
        })
        $(window).on('mousemove', function (event) {
            if (isDown) {
                event = event || window.event;
                swiper.wrapper.get(0).addEventListener('click',swiper.onClick);
                newx = event.clientX - x;
                if(direction == ''){
                    if(newx < 0 ){swiper.dir = 'next';direction='next'}
                    if(newx > 0) {swiper.dir='prev';direction='prev'}
                    swiper.checkOverflow();            
                    translate = swiper.slideGrid[swiper.index];
                }
                if (swiper.index === 0 || swiper.index === swiper.slideGrid.length - 1) {
                    newx = newx / 3;
                }
                swiper.doTranslate(-(translate - newx), true);
            }
        })
        $(window).on('mouseup', function (event) {
            if (isDown) {
                event = event || window.event;
                isDown = false;
                newx = event.clientX;
                swiper.changeTransition(swiper.params.speed);
                if (newx > x) {
                    swiper.index -= 1;
                    swiper.index < 0 ? swiper.index = 0 : '';
                }
                if (newx < x) {
                    swiper.index += 1;
                    swiper.index > swiper.slideGrid.length - 1 ? swiper.index = swiper.slideGrid.length - 1 : ""
                }
                swiper.slideTo(swiper.index);
                // swiper.doTranslate( - swiper.slideGrid[swiper.index]);
                swiper.upDateClass();
                direction='';
                setTimeout( function(){
                    swiper.wrapper.get(0).removeEventListener('click',swiper.onClick);
                },100);
            }
        })
    }

    function touch() {
        var swiper = this, isTouch = false, x, y, newx,newy,translate,direction='';
        swiper.wrapper.get(0).addEventListener('touchstart', function (event) {
            if (event.originalEvent) { event = event.originalEvent; }
            if (swiper.isAnimating == true) { return false }
            // swiper.checkOverflow();
            isTouch = true;
            swiper.changeTransition(0);
            x = event.targetTouches[0].clientX;
            y = event.targetTouches[0].clientY;
        })
        swiper.wrapper.get(0).addEventListener('touchmove', function (event) {
            if (event.originalEvent) { event = event.originalEvent; }
            if (swiper.isAnimating == true) { return false }
            if (isTouch == true) {
                newx = event.targetTouches[0].clientX - x;
                newy =  event.targetTouches[0].clientY - y;
                if(direction =='up'){return false }
                if( (newx > 5 || newx <-5) && direction == '') {  //第一次滑动判断滑动方向  如果是上下 则 return false 如果是左右 就禁用掉默认滑动事件 其中5是误差值
                    direction = 'aside';
                    if(newx < 0 ){swiper.dir = 'next'}
                    if(newx > 0) {swiper.dir='prev'}
                    swiper.checkOverflow();
                    translate = swiper.slideGrid[swiper.index];
                    window.addEventListener('touchmove',swiper.onClick,{passive:false})
                }
                if( (newy >5 || newy < -5) &&direction=='') {direction = 'up';return false; }
                if (swiper.index === 0 || swiper.index === swiper.slideGrid.length - 1) {
                    newx = newx / 2;
                }
                swiper.doTranslate(-(translate - newx), true);
            }
        })
        swiper.wrapper.get(0).addEventListener('touchend', function (event) {
            if(direction =='up') { 
                direction ='';
                return false; 
            }
            if (event.originalEvent) { event = event.originalEvent; }
            newx = event.changedTouches[0].pageX;
            swiper.changeTransition(swiper.params.speed);
            if (newx > x) {
                swiper.index -= 1;
                swiper.index < 0 ? swiper.index = 0 : '';
            }
            if (newx < x) {
                swiper.index += 1;
                swiper.index > swiper.slideGrid.length - 1 ? swiper.index = swiper.slideGrid.length - 1 : "";
            }
            swiper.slideTo(swiper.index);
            swiper.upDateClass();
            window.removeEventListener('touchmove',swiper.onClick)
            direction='';
        })
    }


    function responsive() {
        var swiper = this;
        $(window).on('resize', function () {
            swiper.responsiveFn();
        })
    }


    function getCurTranslate() {
        var swiper = this;
        var cur = swiper.wrapper.css('transform').replace(/[^0-9\,]/g, '').split(',')[4];
        return cur;
    }


    function transitionEnd() {
        var swiper = this;
        var events = ['webkitTransitionEnd', 'transitionend'];
        var selector = swiper.wrapper.get(0);
        var handle = function () {
            swiper.isAnimating = false;
        }
        for (var i = 0; i < events.length; i++) {
            swiper.eventHandle(events[i], selector, handle);
        }
    }

    function eventHandle(eventType, selector, handle) {
        var swiper = this;
        if (selector) {
            selector.addEventListener(eventType, handle);
        }
    }

    function checkOverflow(dir) {
        var swiper = this;
        if (swiper.params.loop === false) { return false }
        if (swiper.index !== 0 && swiper.index !== swiper.maxSlide) { return false }
        if (swiper.index === 0 && (dir || swiper.dir == 'prev')) {
            swiper.changeTransition(0);
            if (swiper.params.slidesPerView === 1) {
                swiper.doTranslate(-swiper.slideGrid[swiper.maxSlide-1], true);
                swiper.index = swiper.maxSlide-1;
            }
            else {
                var index = swiper.maxSlide - (swiper.params.slidesPerView - 2);
                swiper.doTranslate(-swiper.slideGrid[index], true);
                swiper.index = index;
            }
            return swiper;
        }
        if (swiper.index === swiper.maxSlide && (dir || swiper.dir == 'next')) {
            swiper.changeTransition(0);
            if (swiper.params.slidesPerView === 1) {
                swiper.doTranslate(-swiper.slideGrid[1], true);
                swiper.index = 1;
            }
            else {
                swiper.doTranslate(-swiper.slideGrid[swiper.params.slidesPerView - 2], true);
                var ss = swiper.getCurTranslate();
                swiper.index = swiper.params.slidesPerView - 2;
            }
            return swiper;
        }
    }

    function slideTo(index) {
        var swiper = this;
        if (swiper.isAnimating) { return false }
        swiper.doTranslate(- swiper.slideGrid[index]);
        swiper.index = index;
        swiper.upDateClass();
        typeof swiper.afterSlide === 'function' && swiper.afterSlide();
    }

    function slideNext() {
        var swiper = this;
        swiper.checkOverflow();
        setTimeout(function () {
            swiper.dir = 'next';
            swiper.changeTransition(swiper.params.speed);
            var index = swiper.index;
            index >= swiper.maxSlide ? index = 0 : index++;
            swiper.slideTo(index);
        }, 10)
    }

    function slideToRealIndex() {
        var swiper = this;
        var index = swiper.index;
        var slidesPerView = swiper.params.slidesPerView;
        var realIndex = swiper.realIndex;
        var now = realIndex - index;
        if (now >= slidesPerView) {
            swiper.slideTo(realIndex - slidesPerView + 1);
        }
        if (now < 0) {
            swiper.slideTo(realIndex);
        }
    }


    function doTranslate(pixels, noAnimate) {
        var swiper = this;
        if (swiper.support3d) {
            var translate = {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            }
            // typeof noAnimate =='undefined' ? swiper.isAnimating = true : '';
            swiper.wrapper.css(translate);
        }
        else {
            if (typeof noAnimate == 'undefined') {
                // swiper.isAnimating = true;
                swiper.moveCss2(pixels, swiper.params.speed)
            }
            else {
                swiper.moveCss2(pixels, 0);
            }
        }

        return swiper;
    }

    function moveCss2(pixels, speed) {
        var swiper = this;
        swiper.wrapper.animate({ 'left': pixels + 'px', }, speed, function () {
            swiper.isAnimating = false;
        });
    }

    function onClick (e){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }

    //用到的方法
    var methods = {
        setParams: setParams,
        addClass: addClass,
        upDateSlide: upDateSlide,
        slideTo: slideTo,
        getSlideGrid: getSlideGrid,
        loopCreate: loopCreate,
        doTranslate: doTranslate,
        checkBrowser: checkBrowser,
        changeTransition: changeTransition,
        moveCss2: moveCss2,
        drag: drag,
        touch: touch,
        responsive: responsive,
        checkOverflow: checkOverflow,
        upDateClass: upDateClass,
        slideNext: slideNext,
        transitionEnd: transitionEnd,
        eventHandle: eventHandle,
        getCurTranslate: getCurTranslate,
        getBreakPoints: getBreakPoints,
        responsiveFn: responsiveFn,
        slideToRealIndex: slideToRealIndex,
        onClick:onClick,
    }

    //构造函数
    function Swiper(el, options) {
        this.$el = $(el);
        options ? this.params = $.extend({}, defaultOptions, options) : this.params = defaultOptions;
        this.init();
        this.useModules();
    }

    Object.keys(methods).forEach(function (key) {
        !Swiper.prototype[key] ? Swiper.prototype[key] = methods[key] : '';
    })


    Swiper.prototype.init = function () {

        var swiper = this;

        swiper.getBreakPoints();

        swiper.setParams();

        if (swiper.params.play) {

            swiper.params.drag && swiper.isPC == true && swiper.drag()

            swiper.params.touch && swiper.supportTouch && swiper.isPC == false && swiper.touch()

            swiper.index !== 0 && swiper.doTranslate(- swiper.slideGrid[swiper.index])

            swiper.transitionEnd();

            // swiper.changeTransition(swiper.params.speed);

        }

        swiper.params.responsive && swiper.responsive()

    }

    Swiper.prototype.use = function (module) {
        var swiper = this;
        if (Array.isArray(module)) {
            module.forEach(function (m) {
                return swiper.installModule(m);
            })
        }
        else return swiper.installModule(module);
    }

    Swiper.prototype.installModule = function (module) {
        var swiper = this;
        if (!swiper.prototype.module) { swiper.prototype.module = {} }
        swiper.prototype.module[module.name] = module
        // swiper.module[module.name].create = swiper.module[module.name].create.bind(swiper)


    }

    Swiper.prototype.useModules = function () {
        var swiper = this;
        Object.keys(swiper.params).forEach(function (key) {
            if (!$.isEmptyObject(swiper.params[key]) && swiper.module[key]) {
                swiper.params[key] = $.extend(swiper.module[key].params, swiper.params[key]);
                swiper.module[key].create.call(swiper);
                //修复bug 原本是这样写的  swiper的module是共享的对象  所以不能在实例化之后修改swiper.module 
                // swiper.module[key].create = swiper.module[key].create.bind(swiper);
                // swiper.module[key].create();
            }
        })
    }


    //components
    var autoplay$1 = {
        run: function () {
            var swiper = this;
            swiper.autoplay.timeOut = setInterval(function () {
                swiper.slideNext()
            }, swiper.params.autoplay.delay);
        },
        stop: function () {
            var swiper = this;
            clearInterval(swiper.autoplay.timeOut);
        },
    }

    var autoplay = {
        name: 'autoplay',
        params: {
            delay: 3000,
            stopOnHover: false,
        },
        create: function () {
            var swiper = this;
            $.extend(swiper, {
                autoplay: {
                    run: autoplay$1.run.bind(swiper),
                    stop: autoplay$1.stop.bind(swiper),
                }
            })
            swiper.autoplay.run();
            if (swiper.params.autoplay.stopOnHover) {
                swiper.eventHandle('mouseover', swiper.wrapper.get(0), function () {
                    swiper.autoplay.stop();
                })
                swiper.eventHandle('mouseout', swiper.wrapper.get(0), function () {
                    swiper.autoplay.run();
                })
            }
        },
    }

    var navigation$1 = {
        prev: function () {
            var swiper = this;
            swiper.dir = 'prev';
            swiper.checkOverflow();
            setTimeout(function () {
                swiper.changeTransition(swiper.params.speed);
                var index = swiper.index;
                if (index === 0) { return false }
                index -= 1;
                swiper.slideTo(index);
            }, 10);
        },
        next: function () {
            var swiper = this;
            swiper.dir = 'next';
            swiper.checkOverflow();
            swiper.getCurTranslate();
            setTimeout(function () {
                swiper.changeTransition(swiper.params.speed);
                var index = swiper.index;
                var max = swiper.maxSlide;
                if (index === max) { return false }
                index += 1;
                swiper.slideTo(index);
            }, 10);
        }
    }

    var navigation = {
        name: 'navigation',
        params: {
            nextEl: "",
            prevEl: "",
        },
        create: function () {
            var swiper = this;
            var eventType;
            swiper.isPC ? eventType = 'click' : eventType = 'touchend';
            $.extend(swiper, {
                navigation: {
                    prevEl: $(swiper.params.navigation.prevEl),
                    nextEl: $(swiper.params.navigation.nextEl),
                    prev: navigation$1.prev.bind(swiper),
                    next: navigation$1.next.bind(swiper),
                }
            })
            
            swiper.eventHandle(eventType, swiper.navigation.prevEl.get(0), swiper.navigation.prev);
            swiper.eventHandle(eventType, swiper.navigation.nextEl.get(0), swiper.navigation.next);
        }
    }

    var pagination$1 = {
        update: function () {
            var swiper = this;
            var num = 0;
            if (swiper.params.loop) {
                num = swiper.$el.find('.whir-slide:not(.whir-slide-duplicate)').length;
            }
            else {
                num = swiper.maxSlide + 1;
            }
            var box = swiper.params.pagination.el;
            swiper.pagination.els = [];
            for (var i = 0; i < num; i++) {
                swiper.pagination.els[i] = $('<div class= \'whir-pagination-bullet\'></div>').appendTo(box);
            }
        },
    }

    var pagination = {
        name: 'pagination',
        params: {
            el: '',
        },
        create: function () {
            var swiper = this;
            if(swiper.slides.length <= swiper.params.slidesPerView) { return false }
            $.extend(swiper, {
                pagination: {
                    el: $(swiper.params.pagination.el),
                    update: pagination$1.update.bind(swiper),
                }
            })
            swiper.pagination.update();
            swiper.upDateClass();
            var eventType;
            swiper.isPC ? eventType = 'click' : eventType = 'touchend';
            for (var i = 0; i < swiper.pagination.els.length; i++) {
                swiper.pagination.els[i].on(eventType, function (j) {
                    return function () {
                        if (swiper.params.loop) {
                            var cur = swiper.params.slidesPerView - 1;
                            cur == 0 ? cur = 1 : cur;
                            swiper.slideTo(cur + j);
                        } else {
                            swiper.slideTo(j);
                        }
                    }
                }(i))
            }
        }
    }


    var thumb$1 = {
        init: function () {
            var swiper = this;
            var thumb = swiper.thumb.el;
            swiper.afterSlide = thumb$1.afterSlide.bind(swiper)
            var thumbSlides = thumb.slides;
            swiper.thumb.update();
            var eventType;
            swiper.isPC ? eventType = 'click' : eventType = 'touchend';
            for (var i = 0; i < thumbSlides.length; i++) {
                thumbSlides[i].addEventListener(eventType, function (j) {
                    return function () {
                        var index = $(thumbSlides[j]).attr('whir-slide-index')*1;
                        if (thumb.realIndex != index) {
                            thumb.realIndex = index;
                            swiper.slideTo(index);
                            // swiper.slideToRealIndex(index);
                            swiper.thumb.update();
                        }
                    }
                }(i))
            }
        },
        update: function () {
            var swiper = this;
            var realIndex = swiper.realIndex;
            swiper.slides.removeClass('whir-thumb-active');
            $(swiper.$el.find('.whir-slide[whir-slide-index='+realIndex+']')).addClass('whir-thumb-active');
            // $(swiper.slides[realIndex]).addClass('whir-thumb-active');
        },
        afterSlide: function () {
            var swiper = this;
            var index = swiper.index;
            swiper.thumb.el.realIndex = index;
            swiper.thumb.el.slideToRealIndex();
            swiper.thumb.update();
        }   
    }

    var thumb = {
        name: 'thumb',
        create: function () {
            var swiper = this;
            var constructor = swiper.constructor;
            var thumb = swiper.params.thumb.swiper;
            if (!(thumb instanceof constructor)) {
                // console.warn('thumb\'s constructor must be Swiper');
                return false;
            }
            $.extend(swiper, {
                thumb: {
                    el: swiper.params.thumb.swiper,
                    update: thumb$1.update.bind(thumb),
                    init: thumb$1.init.bind(swiper),
                }
            })
            swiper.thumb.init();
        }
    }


    var components = [
        autoplay,
        navigation,
        pagination,
        thumb,
    ]

    if (typeof Swiper.use === 'undefined') {
        Swiper.use = Swiper.prototype.use;
        Swiper.installModule = Swiper.prototype.installModule;
    }

    Swiper.use(components);

    return Swiper;


    //轮播插件结束 
})