# 8-Suited Rummy

A card game built with Next.js, React, and TypeScript. Play against an AI opponent using a custom 4-suit deck with wild jokers.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to play.

## Game Rules

### Overview
8-Suited Rummy is played with a 56-card deck: 4 suits (Swords, Spade, Cups, Hearts) with 13 cards each (Ace through King) plus one Joker per suit. The goal is to empty your hand by forming melds.

### Setup
- Each player receives 10 cards
- Top card of deck starts the discard pile
- Player goes first

### Turn Structure
1. **Draw** - Draw from deck OR click any card in the discard pile (takes that card and all cards above it)
2. **Play** - Form melds, add to existing melds, replace jokers (optional)
3. **Discard** - Discard one card to end your turn

### Melds
- **Sets**: 3-4 cards of the same rank, different suits
- **Runs**: 3+ consecutive cards of the same suit
- Jokers can substitute for any card in a meld

### Special Rules
- **Closing Melds**: Lock a meld to prevent jokers from being replaced
- **Opening Melds**: Reopen a closed meld to allow modifications again
- **Discard Restriction**: Cannot discard the bottom card drawn from the discard pile on the same turn

### Scoring
- First to exceed **25 points** wins the game
- Going out scores 1 point per joker held by opponent (minimum 1 point)
- Holding jokers when opponent goes out: **-1 point per joker**

## Tech Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- localStorage for game persistence

## Project Structure
```
src/
├── app/                    # Next.js app router pages
├── components/game/        # UI components
├── hooks/                  # React hooks (useRummyGame)
└── lib/
    ├── game/              # Game logic (engine, validation, scoring)
    └── bot/               # AI opponent
```
