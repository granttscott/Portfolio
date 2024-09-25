var numButtons = document.querySelectorAll('.drum').length;
var i = 0;
while (i<numButtons){
  document.querySelectorAll('.drum')[i].addEventListener('click', playSound);
  i++;
}
  document.addEventListener('keydown', playKeySound);

function playSound(){
    var buttonInnerHTML = this.innerHTML;
    var audio = new Audio('sounds/'+buttonInnerHTML+'.mp3');
    audio.play();
    buttonAnimation(buttonInnerHTML);
  }
  function playKeySound(e){
    var audio = new Audio('sounds/'+e.key+'.mp3');
    audio.play();
    buttonAnimation(e.key);
  }
  function buttonAnimation(currentKey){
   var activeButton = document.querySelector('.'+currentKey)
   if(activeButton){
    activeButton.classList.add('pressed');
    setTimeout(function(){
      document.querySelector('.'+currentKey).classList.remove('pressed');
    }, 100);
  }
}