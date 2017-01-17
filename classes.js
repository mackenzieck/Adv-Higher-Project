// following are debug comment lines
/*jshint esversion: 6 */
/*globals console:false */
/*globals document:false */
/*globals window:false */
/*globals localStorage:false */
// end debug lines

class Deck {
    constructor() {
        //initialises arrays for cards
        this.availableCards = [];
        this.cutCards = [];
        this.spentCards = [];
        this.players = 5;
    }

    createDeck(decks) {
        //As there are 4 suits per deck it needs to be multiplied for the loop
        decks *= 4;
        //for the amount of suits
        for (var j = 0; j < decks; j++) {
            //and the amount of cards in a suit
            for (var i = 0; i < 14; i++) {
                if (i === 11) {
                    //unicode has a knight card which is not needed for the game
                } else {
                    // adds a card to the main array
                    this.availableCards.push([j, i]);
                }
            }
        }
    }

    shuffle() {
        //fisher-yates shuffle
        var m = this.availableCards.length,
            t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Decrease number of remaining cards
            m -= 1;
            // Pick a remaining element…
            i = Math.floor(Math.random() * m);
            // And swap it with the current element.
            t = this.availableCards[m];
            this.availableCards[m] = this.availableCards[i];
            this.availableCards[i] = t;
        }
        return this.availableCards;
    }

    cut() {
        //remove last 20% of cards
        var len = this.availableCards.length / 5;
        for (let i = 0; i < len; i++) {
            this.cutCards.push(this.availableCards.pop());
        }
    }

    deal() {
        //deal 2 cards to each player and the dealer
        for (var i = 0; i < Players.length; i++) {
            Players[i].cards.push(this.availableCards.pop());
            Players[i].cards.push(this.availableCards.pop());
        }
    }

    hit() {
        return this.availableCards.pop();
    }

    returnCards(cards) {
        this.spentCards.push(cards);
    }

    combineDecks() {
        // when availableCards is empty, push cut and spent cards to it
        for (var i = 0; i < this.cutCards.length; i++) {
            this.availableCards.push(this.cutCards[i]);
        }
        for (var j = 0; i < this.spentCards.length; j++) {
            this.availableCards.push(this.spentCards[j]);
        }
    }

    store() {
        localStorage.availableCards = this.availableCards;
        localStorage.cutCards = this.availableCards;
        localStorage.spentCards = this.availableCards;
        localStorage.players = this.players;
    }
}

class Dealer {
    constructor() {
        this.cards = [];
    }

    display(card) {
        //Change [0, 2] to A ♦
        var prefix = "0x0001F0",
            suit = "",
            cardVal, temp;

        var suits = {
            '0': 'A',
            '1': 'B',
            '2': 'C',
            '3': 'D'
        };
        var value = (card[0] % 4).toString();
        suit = suits[value];
        cardVal = (card[1] + 1).toString(16);
        temp = prefix.concat(suit, cardVal);
        return String.fromCodePoint(temp);
    }

    evaluate() {
        var value = 0;
        for (var k = 0; k < this.cards.length; k++) {
            if (this.cards[k][1] < 10) {
                value += this.cards[k][1] + 1;
            } else {
                value += 10;
            }
        }
        return value;
    }

    stand() {
        playing = false;
        return playing;
    }

    hit() {
        //take card from start of queue
        this.cards.push(deck.hit());
    }

    returnCards(cards) {
        deck.returnCards(this.cards);
        this.cards = [];
    }

    store() {
        localStorage.availableCards = this.availableCards;
        localStorage.cutCards = this.cutCards;
        localStorage.spentCards = this.spentCards;
        localStorage.players = this.players;
    }
}

class VirtualHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wagerBalance = Math.random();
        this.cardBalance = 16;
    }

    wager() {
        let wager = Math.floor(Math.random() * 3);
    }

    cardBalance() {
        //to get a normal (bell curve) distribution I'm adding two random numbers
        //not a statistically sound method but it should do the trick
        var max = 18;
        var min = 14;
        var x = Math.floor(Math.random() * (max - min + 1) + min);
        var y = Math.floor(Math.random() * (max - min + 1) + min);
        this.cardBalance = x + y;
    }

    store(i) {
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wagerBalance", this.wagerBalance);
        localStorage.setItem(i + "cardBalance", this.cardBalance);
    }
}

class PlayerHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wager = 50;
        this.splitCards = [];
        this.handle = "";
    }

    display(card) {
        //Change [0, 2] to A ♦
        var prefix = "0x0001F0",
            suit = "",
            cardVal, temp;

        var suits = {
            '0': 'A',
            '1': 'B',
            '2': 'C',
            '3': 'D'
        };
        suit = suits[card[0] % 4];
        cardVal = (card[1] + 1).toString(16);
        temp = prefix.concat(suit, cardVal);
        return String.fromCodePoint(temp);

        //        if (splitCards != [])
        //            RETURN unicodeCards[splitCards[card][0] MOD 4, splitCards[card][1]]
        //        END IF
    }

    double() {
        this.hit();
        this.wager += this.wager;
        playing = false;
        //double wager
        //receive card
        //end playing
    }

    splitCards() {
        //create two seperate hands
        this.splitCards.push(this.cards.pop);
    }

    store(i) {
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wager", this.wager);
        localStorage.setItem(i + "splitCards", this.splitCards);
        localStorage.setItem(i + "handle", this.handle);
    }
}

////////////////////// MAIN FUNCTION //////////////////////
var deck = new Deck(),
    Players = [];

function Round() {
    var playerLength = Players.length;
    deck.deal();

    for (var i = 0; i < playerLength; i++) {
        Players[i].store(i);
    }

    deck.store();

    // for each AI player
    display();

    //checking for naturals, dealer can have one
    var natural = false;
    for (var n = 1; n < playerLength; n++) {
        if (Players[n].evaluate() == 21) {
            natural = true;
        }
    }

    if (natural === false) {
        for (var l = 1; l < playerLength; l++) {
            while (Players[l].turn) {
                if (Players[l].evaluate() > Players[l].cardBalance) {
                    Players[l].hit();
                } else {
                    Players[l].stand();
                }
            }
        }
    }
}

function newGame() {
    /// hides other screens, displays main game
    play();

    /// ensures that 'the round 1 of 10" text is not displayed
    document.getElementById("roundText").className = "hidden";
    document.getElementById('dealer').style.marginTop = "0px";
    document.getElementById('dealer').style.marginLeft = "100px";

    // Adds AI players to the page
    var hand0 = document.getElementById('hand0');
    var hand1 = document.getElementById('hand1');

    // creates player array
    Players = [];
    //adds dealer to array
    Players.push(new Dealer());

    for (var i = 1; i < deck.players; i++) {
        //adds AI Players to array
        Players.push(new VirtualHand());
    }

    //adds player to array
    Players.push(new PlayerHand());

    deck.createDeck(6);
    deck.shuffle();
    deck.cut();
    var playing = true;

    while (playing) {
        if (deck.availableCards.length > 4 * Players.length) {
            Round();
        } else {
            deck.combineDecks();
            deck.shuffle();
            deck.cut();
        }
    }
}

function loadGame() {
    deck.availableCards = localStorage.getItem('availableCards');
    deck.cutCards = localStorage.getItem('cutCards');
    deck.spentCards = localStorage.getItem('spentCards');
    deck.players = localStorage.getItem('players');

    Players[0].cards = localStorage.getItem('0cards');

    for (var i = 1; i < Players.length + 1; i++) {
        Players[i].cards = localStorage.getItem(i + 'cards');
        Players[i].bank = localStorage.getItem(i + 'bank');
        Players[i].balance = localStorage.getItem(i + 'balance');

        if (i === Players.length) {
            Players[i].cards = localStorage.getItem(i + 'cards');
            Players[i].bank = localStorage.getItem(i + 'bank');
            Players[i].wager = localStorage.getItem(i + 'wager');
            Players[i].splitCards = localStorage.getItem(i + 'splitCards');
            Players[i].handle = localStorage.getItem(i + 'handle');
        }
    }
}

function tournament() {
    play();
    document.getElementById('roundText').className = "inline";
    document.getElementById('dealer').style.marginTop = "-50px";
    document.getElementById('dealer').style.marginLeft = "100px";

    Players = [];
    Players.push(new Dealer()); //adds dealer to array

    Players.push(new PlayerHand()); //adds player to array

    deck.createDeck(6);
    deck.shuffle();
    deck.cut();

    for (var i = 0; i < 10; i++) {
        Round();
    }

    //Sort leaderboard
}

function display() {
    for (var Pl = 0; Pl < deck.players; Pl++) {
        var aiNode = document.getElementById("ai" + (Pl + 1));
        while (aiNode.firstChild) {
            aiNode.removeChild(aiNode.firstChild);
        }

        // for each card in their hand
        for (var Cd = 0; Cd < Players[Pl].cards.length; Cd++) {

            var card = Players[Pl].cards[Cd];
            var content = document.createTextNode(Players[Pl].display(card));
            console.log(content);

            var span = document.createElement("span");
            span.className = "card";
            span.appendChild(content);
            aiNode.appendChild(span);
        }
    }
}

////////////////////// CLICKING //////////////////////
var main = makeClicker("mainScreen");
var game = makeClicker("gameScreen");
var rules = makeClicker("rulesScreen");
var leaderboard = makeClicker("leaderboardScreen");
var exit = makeClicker("exit");
var play = makeClicker("mainGame");
var game2 = makeClicker("gameScreen2");


function makeClicker(Button) {
    return function () {
        var x = document.querySelectorAll(".screen");
        for (var i = 0; i < x.length; i++) {
            x[i].className = 'screen hidden';
        }
        document.getElementById(Button).className = 'screen';
    };
}

document.getElementById('game').onclick = game;
document.getElementById('create').onclick = game2;
document.getElementById('rules').onclick = rules;
document.getElementById('leaderboard').onclick = leaderboard;
document.getElementById('exit').onclick = exit;

var y = document.querySelectorAll(".return");
for (var k = 0; k < y.length; k++) {
    y[k].onclick = main;
}

document.getElementById('decPlayers').onclick = function () {
    if (deck.players > 1) deck.players--;
};

document.getElementById('incPlayers').onclick = function () {
    if (deck.players < 5) deck.players++;
};

document.getElementById('play').onclick = function () {
    newGame();
};

document.getElementById('tournament').onclick = function () {
    tournament();
};

document.getElementById('hit').onclick = function () {
    Players[2].hit();
};

window.setInterval(function () {
    document.getElementById('players').innerHTML = deck.players;
    display();
}, 100);

/*
DISPLAYING PLAYER MOVES

var display = Math.floor(playerLength / 2);
    for (var j = 1; j < display + 1; j++) {
    */
