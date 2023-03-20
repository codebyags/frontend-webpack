// Include scss
import "../scss/index.scss";

// Images
import "./images.js";

/* 
    Libs 
*/

// Lazyload
import LazyLoad from "vanilla-lazyload";
var myLazyLoad = new LazyLoad();
myLazyLoad.update();

// Swiper
import Swiper from 'swiper';
import '../../node_modules/swiper/swiper.scss';

const swiper = new Swiper('#js-test-slider', {
    slidesPerView: 3,
    spaceBetween: 30,
    pagination: {
        el: "#js-test-slider-pagination",
        clickable: true,
    }
});

// MagicScroll + GSAP
import ScrollMagic from 'scrollmagic';
import { TweenMax, TimelineMax } from "gsap"; // What to import from gsap
import { ScrollMagicPluginGsap } from "scrollmagic-plugin-gsap";
 
ScrollMagicPluginGsap(ScrollMagic, TweenMax, TimelineMax); // Pass gsap import to Scrollmagic

var controller = new ScrollMagic.Controller();
var scene = new ScrollMagic.Scene({triggerElement: "#my-sticky-element-trigger", duration: "50%"})
    .setTween("#my-sticky-element", {
        backgroundColor: "blue", 
        scale: 0.7,
        x: '300px',
        rotate: 180
    })
    .addTo(controller);
