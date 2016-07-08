# Description

A diceroller for Slack, built on [Webtask](https://webtask.io).

# Installation

To install Webtask and get your bot endpoint

```
npm install wt-cli -g
wt init
wt create roller.js
```

The output of the above will be in a url, and you can now go configure Slack!

# Configure Slack

* Go to <yourslackteam>.slack.com/apps/build
* Click on 'Make a Custom Integration'
* Select 'Slash Commands'
* Pick a command for the bot, I chose `/roller`, then click 'Add Slash Command Integration'

Now there's a little bit of configuration to be done...

* Find 'URL' and enter the Webtask URL you got from the installation steps
* Change the 'Method' dropdown to 'GET'
* Under 'Customize Icon' select the nice Dice emoji
* Optionally check the 'Show this command in the autocomplete list' checkbox
  * Fill in a Description (like "Roll a virtual (bucketload) of dice!")
  * Add a Usage hint ([2D6+10])

# Using the bot

In your Slack channel, simply type `/roller help` and you'll see the available commands. You can
store a custom default dice formula (it's initially set to 'D20'), or roll a custom formula at will.

The bot works with [Standard Dice Notation](https://en.wikipedia.org/wiki/Dice_notation), and the 
actuall 'rolling engine' is [Droll](https://github.com/thebinarypenguin/droll), simply brought inline
in order to work correctly with Webtask.