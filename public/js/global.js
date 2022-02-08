//sizing footer
function resizePlace2() {
    var offsetHeight1 = document.getElementsByClassName('place2')[4].offsetHeight;
    console.log(offsetHeight1)
    console.log(document.getElementsByClassName('place2'))
    document.getElementsByClassName('place2')[5].style.height = offsetHeight1 + "px";
    console.log(document.getElementsByClassName('place2')[5].offsetHeight)
}
resizePlace2()
window.addEventListener('resize', resizePlace2);