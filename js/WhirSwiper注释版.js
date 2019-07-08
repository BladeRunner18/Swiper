


//插件调用参数说明

//基于jquery  在此插件之前要引入jquery
//作者 '万户 / Whir'

// 调用方法
// var swiper = new Swiper ('.swiper-container',{
//    //参数
// })


// 闭包
// 立即执行函数，将window，jquery作为参数，
// 第三个参数为一个函数，传到立即执行函数里面执行，执行结果返回构造函数Swiper

(function (global, $, factory) {

    global.Swiper = factory();

})(window, jQuery, function () {

    'use strict';

    var vision = '1.0';

    //作者
    var Author = '万户 / Whir';

    //插件的默认参数
    var defaultOptions = {
        //每一页的数量
        slidesPerView: 1,
        //每一个之间的边距
        spaceBetween: 0,
        initIndex: '',
        //循环
        loop: false,
        //自动切换
        autoplay: null,
        //切换速度
        speed: 500,
        //左右按钮
        navigation: null,
        //分页器
        pagination: null,
        //响应式设置
        breakPoints: {},
        //拖拽切换
        drag: true,
        //滑动切换
        touch: true,
        //响应式
        responsive: true,
        //使用dom上的参数
        useData: false,
        //是否需要轮播
        play: true,
        //缩略图
        thumb: null,
    }

    //当useData为true的时候获取到dom结构上面的参数，并将参数设置到swiper.params里面
    function getBreakPoints() {
        var swiper = this;
        if (swiper.params.useData) {
            //获取到swiper-wrappper这个元素上面的所有属性
            var nodeAttr = swiper.$el.find('.swiper-wrapper').get(0).attributes;
            var data = {};
            //判断是否是数字的正则表达式
            var reg = /^[0-9]*$/;
            //用数组的slice方法将伪数组转换为数组然后遍历
            [].slice.call(nodeAttr).forEach(function (node) {
                //获取到属性名称
                var attrName = node.name;
                //如果属性名称是以swiper开头
                if (attrName.indexOf('swiper') === 0) {
                    var exp = attrName.substring(7);
                    data[exp] = {};
                    //设置参数
                    if (exp == 'play') { node.value === 'false' ? swiper.params.play = false : swiper.params.play = true }
                    if (exp == 'drag') { node.value === 'false' ? swiper.params.drag = false : swiper.params.drag = true }
                    if (exp == 'pagination') { swiper.params.pagination.el=node.value }
                    if (exp == 'navigation') { swiper.params.navigation.prevEl=node.value.split(',')[0]; swiper.params.navigation.nextEl = node.value.split(',')[1];}
                    //验证如果是数字
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

    //设置一些参数
    function setParams() {
        var swiper = this;
        swiper.slides = swiper.$el.find('.swiper-slide');
        swiper.wrapper = swiper.$el.find('.swiper-wrapper');
        if (swiper.params.play) {
            //切换方向
            swiper.dir = '';
            swiper.realIndex = 0;
            swiper.checkBrowser();
            swiper.realSlides = swiper.wrapper.find('.swiper-slide').length;
            swiper.isAnimating = false;
            swiper.addClass();
            swiper.params.initIndex != '' ? swiper.index = swiper.params.initIndex : swiper.index = 0;
            swiper.params.loop && swiper.loopCreate();
        }
        swiper.responsiveFn();
    }

    //检查浏览器然后设置三个参数到swiper实例上
    //swiper.isPC 判断是否是pc端
    //swiper.support3d 判断是否支持css3动画
    //swiper.supportTouch 判断是否支持滑动
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

    //改变动画过渡时间的函数
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

    //给每个slide添加属性
    function addClass() {
        var swiper = this;
        for (var i = 0; i < swiper.slides.length; i++) {
            $(swiper.slides[i]).attr('swiper-slide-index',i);
        }
    }

    //无线循环实现函数
    function loopCreate() {
        var swiper = this;
        var params = swiper.params;
        //根据每页的个数然后复制相应个slide分别依次插入到前面和后面，每次切换前调用checkoverflow来检查是否是最后一个 
        if (params.slidesPerView === 1) {
            swiper.wrapper.prepend($(swiper.slides[swiper.slides.length - 1]).clone(true).addClass('swiper-slide-duplicate'));
            swiper.wrapper.append($(swiper.slides[0]).clone(true).addClass('swiper-slide-duplicate'));
            swiper.slides = swiper.$el.find('.swiper-slide');
            swiper.index = 1;
        }
        else {
            for (var i = 0; i < params.slidesPerView - 1; i++) {
                swiper.wrapper.prepend($(swiper.slides[swiper.slides.length - 1 - i]).clone(true).addClass('swiper-slide-duplicate'));
                swiper.wrapper.append($(swiper.slides[i]).clone(true).addClass('swiper-slide-duplicate'));
            }
            swiper.slides = swiper.$el.find('.swiper-slide');
            swiper.index = swiper.params.slidesPerView - 1;
        }
    }

    //根据屏幕窗口大小和传进来的响应式参数  来动态更新宽度边距等
    function responsiveFn() {
        var swiper = this;
        var points = swiper.params.breakPoints;
        var width = $(window).width();
        var num, space, outerWidth;
        var index = swiper.index;
        outerWidth = swiper.$el.width();
        //讲breakpoints里面的参数从大到小排序一下然后遍历  获取到当前屏幕设置的个数和边距
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
            //获取到之后就可以更新swiper的宽度了 
            swiper.upDateSlide(outerWidth, num, space)
            swiper.params.play && swiper.slideTo(index);
        }

    }

    //更新slide   通过三个参数  来计算出每个silide的宽度  
    //三个参数分别为 最外层宽度  页面展示的个数，每个之间的边距
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
            // if (!swiper.support3d) {
            // }
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

    //获取所有轮播的translate值 并保存到数组  所有的轮播都是通过这个数组来实现的
    function getSlideGrid() {
        var swiper = this;
        var arr = [];
        for (var i = 0; i <= swiper.slides.length - swiper.params.slidesPerView; i++) {
            arr[i] = (i * swiper.singleWidth) + (i * swiper.params.spaceBetween);
        }
        swiper.slideGrid = arr;
        swiper.maxSlide = swiper.slideGrid.length - 1;
    }


    //更新active的class 和分页器的class
    function upDateClass() {
        var swiper = this;
        var index = swiper.index;
        swiper.pagination != undefined && swiper.pagination.els.forEach(function (el) { $(el).removeClass('swiper-pagination-active'); })
        swiper.slides.removeClass('swiper-slide-active swiper-slide-prev swiper-slide-next');
        if (swiper.params.loop) {
            var realIndex = swiper.wrapper.find('.swiper-slide').eq(index).attr('swiper-slide-index');
            swiper.pagination != undefined && swiper.pagination.els[realIndex].addClass('swiper-pagination-active');
            swiper.wrapper.find('.swiper-slide').eq(index).addClass('swiper-slide-active').prev().addClass('swiper-slide-prev');
            swiper.wrapper.find('.swiper-slide').eq(index).addClass('swiper-slide-active').next().addClass('swiper-slide-next');
        } else {
            swiper.pagination != undefined && swiper.pagination.els[index].addClass('swiper-pagination-active')
            swiper.wrapper.find('.swiper-slide-index-' + realIndex + ':not(.swiper-slide-duplicate)').addClass('swiper-slide-active').prev().addClass('swiper-slide-prev');
            swiper.wrapper.find('.swiper-slide-index-' + realIndex + ':not(.swiper-slide-duplicate)').next().addClass('swiper-slide-next');        }
    }
 
    //pc端拖拽实现函数
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
                    //第一次move判断方向
                    if(newx < 0 ){swiper.dir = 'next';direction='next'}
                    if(newx > 0) {swiper.dir='prev';direction='prev'}
                    //检查是否已经到边界
                    swiper.checkOverflow();            
                    translate = swiper.slideGrid[swiper.index];
                }
                if (swiper.index === 0 || swiper.index === swiper.slideGrid.length - 1) {
                    //如果已经到边界  则减少newx的值  来达到一种到底了拖不动的感觉
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

    //移动端滑动实现函数
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
                if( (newx > 5 || newx <-5) &&direction == '') {  //第一次滑动判断滑动方向  如果是上下 则 return false 如果是左右 就禁用掉默认滑动事件 其中5是误差值
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


    //响应函数 
    function responsive() {
        var swiper = this;
        $(window).on('resize', function () {
            swiper.responsiveFn();
        })
    }

    //获取当前dow元素的translate的值
    function getCurTranslate() {
        var swiper = this;
        var cur = swiper.wrapper.css('transform').replace(/[^0-9\,]/g, '').split(',')[4];
        return cur;
    }


    //监听每次动画执行结束后执行的回调函数  暂时没有启用
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

    //添加事件
    function eventHandle(eventType, selector, handle) {
        var swiper = this;
        if (selector) {
            selector.addEventListener(eventType, handle);
        }
    }

    //当开启循环的时候  检查是否到边界 来实现无限循环
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

    //滑动到第几个
    function slideTo(index) {
        var swiper = this;
        if (swiper.isAnimating) { return false }
        swiper.doTranslate(- swiper.slideGrid[index]);
        swiper.index = index;
        swiper.upDateClass();
        typeof swiper.afterSlide === 'function' && swiper.afterSlide();
    }

    //滑动到下一个
    function slideNext() {
        var swiper = this;
        swiper.dir = 'next';
        swiper.checkOverflow();
        setTimeout(function () {
            swiper.changeTransition(swiper.params.speed);
            var index = swiper.index;
            index >= swiper.maxSlide ? index = 0 : index++;
            swiper.slideTo(index);
        }, 10)
    }

    //因为是用slideGrid获取的所有滑动的值的数组，所以当前的index 并不一定等于第index个slide
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


    //执行动画 所有最终都是通过这个函数来执行的滑动
    function doTranslate(pixels, noAnimate) {
        var swiper = this;
        //如果支持css3，使用translate
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
        //不支持css3 将使用jquery 的animate方法来实现
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

    //jquery的animate方法  
    function moveCss2(pixels, speed) {
        var swiper = this;
        swiper.wrapper.animate({ 'left': pixels + 'px', }, speed, function () {
            swiper.isAnimating = false;
        });
    }

    //阻止默认点击事件，有时候我们需要在a标签上拖拽 必要要阻止默认事件  不然页面会跳转
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
        //检查是否传了参数，如果传了参数将参数和默认参数合并
        options ? this.params = $.extend({}, defaultOptions, options) : this.params = defaultOptions;
        //执行初始化
        this.init();
        //根据传入的参数来选择是否要加载某些模块
        this.useModules();
    }

    //将上面的所有方法都添加的swiper构造函数的原型链上  这样子实例将共享所有方法
    Object.keys(methods).forEach(function (key) {
        !Swiper.prototype[key] ? Swiper.prototype[key] = methods[key] : '';
    })


    //初始化函数
    Swiper.prototype.init = function () {

        var swiper = this;

        //获取dom上面的参数
        swiper.getBreakPoints();

        swiper.setParams();

        if (swiper.params.play) {

            swiper.params.drag && swiper.isPC == true && swiper.drag()

            swiper.params.touch && swiper.supportTouch && swiper.isPC == false && swiper.touch()

            swiper.index !== 0 && swiper.doTranslate(- swiper.slideGrid[swiper.index])

            swiper.transitionEnd();

        }

        swiper.params.responsive && swiper.responsive()

    }

    //为构造函数添加某个模块的添加方法
    Swiper.prototype.use = function (module) {
        var swiper = this;
        if (Array.isArray(module)) {
            module.forEach(function (m) {
                return swiper.installModule(m);
            })
        }
        else return swiper.installModule(module);
    }

    //为添加的模块初始化
    Swiper.prototype.installModule = function (module) {
        var swiper = this;
        if (!swiper.prototype.module) { swiper.prototype.module = {} }
        swiper.prototype.module[module.name] = module
        // swiper.module[module.name].create = swiper.module[module.name].create.bind(swiper)
    }

    //跟据参数来选择是否加载某些模块
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

    //自动轮播组件
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

    //左右按钮组件
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

    //分页器组件
    var pagination$1 = {
        update: function () {
            var swiper = this;
            var num = 0;
            if (swiper.params.loop) {
                num = swiper.$el.find('.swiper-slide:not(.swiper-slide-duplicate)').length;
            }
            else {
                num = swiper.maxSlide + 1;
            }
            var box = swiper.params.pagination.el;
            swiper.pagination.els = [];
            for (var i = 0; i < num; i++) {
                swiper.pagination.els[i] = $('<div class= \'swiper-pagination-bullet\'></div>').appendTo(box);
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

    //缩略图组件
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
                        var index = $(thumbSlides[j]).attr('swiper-slide-index')*1;
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
            swiper.slides.removeClass('swiper-thumb-active');
            $(swiper.$el.find('.swiper-slide[swiper-slide-index='+realIndex+']')).addClass('swiper-thumb-active');
            // $(swiper.slides[realIndex]).addClass('swiper-thumb-active');
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

    //将组件添加到原型链中
    Swiper.use(components);

    //返回构造函数
    return Swiper;

})