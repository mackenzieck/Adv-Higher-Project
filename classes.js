class Deck {
    constructor(decks, cards, spentCards) {
        this.availableCards = cards;
        this.spentCards = spentCards;
    }

    createDeck(decks) {
        decks *= 4
        for (j = 0; j < decks; j++) {
            availableCards.push(new Array());
            for (i = 0; i < 13; i++) {
                array[j][i] = i;
            }
        }
        return availableCards;
    }

    shuffle() {
        //fisher-yates shuffle
    }

    cut() {
        //remove last 20% of cards
    }
}

class Dealer {
    stand() {
        //end turn
    }

    hit() {
        //take next card from queue
        //continue turn
    }
}

class Hand extends Dealer {
    double() {
        //double wager
        //receive card
        //end turn
    }

    splitCards() {
        //create two seperate hands
    }
}

deck = new Deck(6);