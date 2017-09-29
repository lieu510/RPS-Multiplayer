$(document).ready(function () {
    
    var config = {
        apiKey: "AIzaSyDv2jtAEA-s0dGK3Lxtg_I60LFR6tGSr7k",
        authDomain: "rps-multiplayer-76222.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-76222.firebaseio.com",
        projectId: "rps-multiplayer-76222",
        storageBucket: "",
        messagingSenderId: "129507691840"
    };
    firebase.initializeApp(config);

    var name;
    var player1Wins;
    var player2Wins;
    var player1Losses;
    var player2Losses;
    var player1Name;
    var player2Name;
    var userId;
    var myChoices;
    var opponentId;
    var opponentName;
    var turn;
    var newTurn;
    var choices = ["Rock", "Paper", "Scissors"];
    var player1Choice;
    var player2Choice;
    var winnderid;
    // displays game and player status
    firebase.database().ref().once('value', function(snapshot){
        if (snapshot.child('players').child('1').exists() && snapshot.child('players').child('2').exists()){
            $("#gameStatus").html("<h2>Game is full</h2>");
        }
    });
    // sets player number
    firebase.database().ref().on('value', function(snapshot){
        if (name === undefined && !snapshot.child('players').child('1').exists()){
            userId = "1";
        } else if(name === undefined && !snapshot.child('players').child('2').exists()){
            userId = "2";
        }
        if (snapshot.child('players').child('1').exists() && snapshot.child('players').child('2').exists()){
            opponentName = snapshot.child('players').child(opponentId).child('name').val();
        } else {
            $("#gameStatus").empty();
        }
    });
    // inserts player into database
    firebase.database().ref('players').on('value', function(snapshot){
        if (snapshot.child('1').exists()){
            player1Name = snapshot.child('1').child('name').val();
            player1Wins = snapshot.child('1').child('wins').val();
            player1Losses = snapshot.child('1').child('losses').val();
            $("#player1Status").html("<h4>" + player1Name + "</h4>");
            $("#player1Score").html("<h4>Wins: " + player1Wins + " Losses: " + player1Losses + "</h4>");
        } else {
            $("#player1Status").html("<h4>Waiting for Player 1</h4>");
            $("#player1Score").empty();
            $("#player2Choices").empty();
        }
        if(snapshot.child('2').exists()){
            player2Name = snapshot.child('2').child('name').val();
            player2Wins = snapshot.child('2').child('wins').val();
            player2Losses = snapshot.child('2').child('losses').val();
            $("#player2Status").html("<h4>" + player2Name + "</h4>");
            $("#player2Score").html("<h4>Wins: " + player2Wins + " Losses: " + player2Losses + "</h4>");
        } else {
            $("#player2Status").html("<h4>Waiting for Player 2</h4>");
            $("#player2Score").empty();
            $("#player1Choices").empty();
        }
    });
    // remove data when player leaves
    window.onunload = function(){
        firebase.database().ref('players').child(userId).remove();
        firebase.database().ref().child('turn').remove();
        if (name !== undefined) {
            firebase.database().ref('messages').push({
                name: name,
                message: "has left the game."
            });
        }
    };
    $("#setName").on("click", function(){
        event.preventDefault();
        name = $("#inputName").val();
        $("#inputName").val("");
        opponentId = userId === "1" ? "2" : "1";
        myChoices = userId === "1" ? $("#player1Choices") : $("#player2Choices");
        firebase.database().ref('players').child(userId).set({
            name: name,
            wins: 0,
            losses: 0
        });
        firebase.database().ref('messages').push({
            name: name,
            message: "has joined the game."
        });
        firebase.database().ref().once('value', function(snapshot){
            if (snapshot.child('players').child('1').exists() && snapshot.child('players').child('2').exists()){
                firebase.database().ref().update({
                    turn: "1"
                });
            }
        });
    });

    firebase.database().ref('turn').on('value', function(snapshot) {
        turn = snapshot.val();
        if (turn === "1") {
            player1Choice = "";
            player2Choice = "";
            $("#player1Choices").empty();
            $("#player2Choices").empty();
            firebase.database().ref('players').child('1').child('choice').remove();
            firebase.database().ref('players').child('2').child('choice').remove();
        }
        if (turn === userId){
            $("#gameStatus").html("<h2>It's your turn!</h2>");
            //myChoices.empty();
            for (var i = 0; i < choices.length; i++) {
                myChoices.append("<span class='choice'>" + choices[i] + "</span><br>");
            }
        } else if (turn === opponentId) {
            $("#gameStatus").html("<h2>Waiting for " + opponentName + " to choose</h2>");
        }
        newTurn = turn === "1" ? "2" : "1";
    });

    $(document).on("click", ".choice", function(){
        event.preventDefault();
        var choice = $(this).html();
        myChoices.html("<h1>" + choice + "</h1>");
        firebase.database().ref('players').child(userId).update({
            choice: choice
        });
        if (turn === "2") {
            setTimeout(setNewTurn, 4000);
        } else {
            setNewTurn();
        }
    });

    function setNewTurn() {
        firebase.database().ref().update({
            turn: newTurn
        });
    }

    function findWinner() {
        firebase.database().ref('players').once('value', function(snapshot){
            player1Choice = snapshot.child('1').child('choice').val();
            player2Choice = snapshot.child('2').child('choice').val();
        });
        if (player1Choice === player2Choice) {
            winnderid = 0;
        } else if (player1Choice === "Rock" && player2Choice === "Scissors") {
            winnderid = 1;
        } else if (player1Choice === "Rock" && player2Choice === "Paper") {
            winnderid = 2;
        } else if (player1Choice === "Scissors" && player2Choice === "Rock") {
            winnderid = 2;
        } else if (player1Choice === "Scissors" && player2Choice === "Paper") {
            winnderid = 1;
        } else if (player1Choice === "Paper" && player2Choice === "Rock") {
            winnderid = 1;
        } else if (player1Choice === "Paper" && player2Choice == "Scissors") {
            winnderid = 2;
        } 
        if (winnderid === 1) {
            $("#gameStatus").html("<h2>" + player1Name + " Wins!</h2>");
            firebase.database().ref('players').child('1').update({
                wins: player1Wins + 1
            });
            firebase.database().ref('players').child('2').update({
                losses: player2Losses + 1
            });
        } else if (winnderid === 2) {
            $("#gameStatus").html("<h2>" + player2Name + " Wins!</h2>");
            firebase.database().ref('players').child('2').update({
                wins: player2Wins + 1
            });
            firebase.database().ref('players').child('1').update({
                losses: player1Losses + 1
            });
        } else if (winnderid === 0) {
            $("#gameStatus").html("<h2>It's a tie!</h2>");
        }
    }
    firebase.database().ref('players').child('2').child('choice').on('value', function(snapshot) {
        if (turn === "2") {
            findWinner();
        }
        if (player1Choice && player2Choice) {
            $("#player1Choices").html("<h1>" + player1Choice + "</h1>");
            $("#player2Choices").html("<h1>" + player2Choice + "</h1>");
        }
    });
    
    $("#sendMsg").on("click", function(){
        event.preventDefault();
        var msg = $("#inputMsg").val();
        firebase.database().ref('messages').push({
            name: name + ":",
            message: msg
        });
        $("#inputMsg").val("");
    });

    firebase.database().ref('messages').on('child_added', function(snapshot) {
        $("#chatBox").append("<span>" + snapshot.val().name + " " + snapshot.val().message + "</span><br>");
        // $("#chatBox").empty();
        // snapshot.forEach(function(message) {
        //     $("#chatBox").append("<span>" + message.val() + "</span><br>");
        // });
    });

});