// Снежинок на странице
var snowCountMax = 20;
// Массив цветов снега
var arrColor = ["#AAAACC", "#DDDDFF", "#CCCCDD", "#F3F3F3", "#F0FFFF", "#FFFFFF", "#EFF5FF"];
// Символ снежинки
var snowView = "*";
// Скорость падения (чем больше число, тем медленней)
var speed = 0.5;
// Максимальный размер
var sizeMax = 48;
// Минимальный размер
var sizeMin = 20;
var screenHeight;
var screenWidth;
var timer;

function initSnow() {
    // размер экрана
    screenHeight = $(document).height();
    screenWidth = $(document).width();

    var sizeRange = sizeMax - sizeMin;
    for(i = 0; i <= snowCountMax; i++){
        var sizeFont = Math.floor(sizeRange*Math.random())+sizeMin; // случайный размер снежинки
        var posx = Math.floor((screenWidth-sizeFont*2)*Math.random()); // снежинки по всей оси X
        var posy = Math.floor((screenHeight-sizeFont*2)*Math.random()); // снежинки по всей оси Y
        var randColor = arrColor[Math.floor(arrColor.length*Math.random())]; // случайный цвет
        var size = Math.floor(sizeRange*Math.random()) + sizeMin;
        span = $("#snow_"+i); // снежинка по порядку
        span.css('fontSize', sizeFont+"px"); // задаем ей размер
        span.css('color', randColor); // цвет
        span.attr('size', size); // в атрибут сохраняем скорость этой снежинки
        span.attr('speed', speed*sizeFont/5); // в атрибут сохраняем скорость этой снежинки
        span.attr('posx', posx); // в атрибут пишем положение по X
        span.attr('posy', posy); // в атрибут пишем положение по Y
        span.css('left', posx+"px"); // задаем положение по X
        span.css('top', posy+"px"); // задаем положение по Y
    }
    moveSnow();
}

// падение снежинок
function moveSnow() {
    for(i = 0; i <= snowCountMax; i++){
        span = $("#snow_"+i); // снежинка по порядку
        var posy = parseInt(span.attr('posy')) + parseInt(span.attr('speed'));
        var posx = parseInt(span.attr('posx'));
        var size = parseInt(span.attr('size'));
        var margin = posx + Math.floor(Math.random()*4)-2; // колыхание по X
        span.animate({
            top: posy+"px",
            left: margin + "px"
        }, 70);
        span.attr('posy', posy);
        span.attr('posx', margin);
        var sizeRange = sizeMax - sizeMin;
        var sizeFont = Math.floor(sizeRange*Math.random()) + sizeMin; // случайный размер снежинки
        if(posy >= (screenHeight-sizeFont*2)){ // если снежинка полностью опустилась
            posx = Math.floor((screenWidth-sizeFont*2)*Math.random()); // снежинки по всей оси X
            span.attr('posx', posx);
            span.attr('posy', 0);
            span.css('fontSize', sizeFont+"px"); // меняем размер
        }
    }
    var timer = setTimeout("moveSnow()", 70);
}

// создаем на  странице снежинки
for (i = 0; i <= snowCountMax; i++){
    $('body').append("<span id='snow_"+i+"' style='position: absolute;'>"+snowView+"</span>");
}
// запускам снегопад
initSnow();