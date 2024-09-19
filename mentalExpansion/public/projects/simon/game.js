var buttonColors = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userPattern = [];
var highScore = 0;


$(document).on("keydown", startGame);

function startGame() {
userPattern = [];
gamePattern = [];
$("#hidden").css("display", "none");
$("#level-title").css("color", "#FEF2BF");
$("#level-title").text("Level 1");
    randomColor();

}
$("#hard").click(function() {
    var isHardMode = $(this).data("hard-mode") || false;
    
    if (isHardMode) {
        $(".red").css("background-color", "red");
        $(".blue").css("background-color", "blue");
        $(".green").css("background-color", "green");
        $(".yellow").css("background-color", "yellow");
        $("body").css("background-color", "#011F3F");
    } else {
        $(".red").css("background-color", "var(--primary-color)");
        $(".blue").css("background-color", "var(--secondary-color)");
        $(".green").css("background-color", "var(--tertiary-color)");
        $(".yellow").css("background-color", "var(--quaternary-color)");
        $("body").css("background-color", "white");
    }
    
    $(this).data("hard-mode", !isHardMode);
});

$(".btn") .click(function() {
    var userColor = $(this).attr("id");
    userPattern.push(userColor);
    animateUserChoice();
    checker();
    console.log('user', userPattern);
});

function randomColor() {
 var num =  Math.floor(Math.random() * 4);
 var color = buttonColors[num];
    gamePattern.push(color);
    animateSequence();
    console.log('pattern', gamePattern);
}  

function animateSequence() {
    gamePattern.forEach(function(color, index) {
        setTimeout(function() {
            $("#" + color).fadeIn(100).fadeOut(100).fadeIn(100);
            var audio = new Audio("sounds/" + color + ".mp3");
            audio.play();
        }, 500 * index);
    });
}
function animateUserChoice() {
            var userColor = userPattern[userPattern.length - 1];
            var audio = new Audio("sounds/" + userColor + ".mp3");
            audio.play();
            $("#" + userColor).fadeIn(100).fadeOut(100).fadeIn(100);
    }
function checker() {
if (userPattern.length === gamePattern.length) {
    if (arraysEqual(userPattern, gamePattern)) {
        console.log('checker', userPattern, gamePattern);
        var messages = ["Correct!", "WOW!", "Monster Work.", "Little Einstein in the House!", "Whamo!", "Wowzers!", "You're on Fire!", "You're a Wizard, Harry.", "Supercalafragalisticexpialadoshus", "Phone call for you, its the Government, they want to know how you're so good at this game."];
        var randomMessage = messages[Math.floor(Math.random() * messages.length)];
        console.log(randomMessage);
        $("#level-title").text(randomMessage);
        $("#level-title").css("color", "green");
        setTimeout(function() {
            $("#level-title").css("color", "#FEF2BF");
            $("#level-title").text("Level " + (gamePattern.length + 1));
        }, 1500);
        userPattern = [];
        setTimeout(function() {
            randomColor();
        }, 1000);a
    }
    else {
        $("#level-title").text("Game Over, you made it to Level " + (gamePattern.length + 1) + ".");
        $("#level-title").addClass("game-over");
        $("#hidden").css("display", "block");
        if (gamePattern.length > highScore) {
            highScore = gamePattern.length + 1;
            $("#score").text("High Score: " + highScore);
        }
    }
}
}

function arraysEqual(arr1, arr2) {
    return arr1.every((value, index) => value === arr2[index]);
}