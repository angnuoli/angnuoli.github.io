$(document).ready(function(){function t(){function t(){$(o+" "+i).removeClass(i.substring(1))}var o=".post-toc",e=$(o),i=".active-current";e.on("activate.bs.scrollspy",function(){var i=$(o+" .active").last();t(),i.addClass("active-current"),e.scrollTop(i.offset().top-e.offset().top+e.scrollTop()-e.height()/2)}).on("clear.bs.scrollspy",t),$("body").scrollspy({target:o})}t()}),$(document).ready(function(){$(document).on("click",".fold_hider",function(){$(">.fold",this.parentNode).slideToggle(),$(">:first",this).toggleClass("open")}),$("div.fold").css("display","none")}),$(document).ready(function(){var t=$("html"),o=200,e=$.isFunction(t.velocity);$(".sidebar-nav li").on("click",function(){var t=$(this),i="sidebar-nav-active",s="sidebar-panel-active";if(!t.hasClass(i)){var a=$("."+s),l=$("."+t.data("target"));e?a.velocity("transition.slideUpOut",o,function(){l.velocity("stop").velocity("transition.slideDownIn",o).addClass(s)}):a.animate({opacity:0},o,function(){a.hide(),l.stop().css({opacity:0,display:"block"}).animate({opacity:1},o,function(){a.removeClass(s),l.addClass(s)})}),t.siblings().removeClass(i),t.addClass(i)}}),$(".post-toc a").on("click",function(o){o.preventDefault();var i=NexT.utils.escapeSelector(this.getAttribute("href")),s=$(i).offset().top;e?t.velocity("stop").velocity("scroll",{offset:s+"px",mobileHA:!1}):$("html, body").stop().animate({scrollTop:s},500)});var i=$(".post-toc-content"),s=CONFIG.page.sidebar;if("boolean"!=typeof s){var a="post"===CONFIG.sidebar.display||"always"===CONFIG.sidebar.display,l=i.length>0&&i.html().trim().length>0;s=a&&l}s&&(CONFIG.motion.enable?NexT.motion.middleWares.sidebar=function(){NexT.utils.displaySidebar()}:NexT.utils.displaySidebar())});