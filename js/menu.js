//jQuery moet op een andere manier worden toegevoegd
window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')
var extended = false;

function extendMenu(){
    if(extended){
        $('.sidebar').eq(0).removeClass("extended")
        extended = false;
    }
    else{
        $('.sidebar').eq(0).addClass("extended")
        extended = true;
    }
}


