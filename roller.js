module.exports = function(ctx, cb) {
    var command = ctx.data.text;
    if (command == "help") {
        return cb(null, helpText(ctx.data.command));
    }

    ctx.storage.get(function(error, data) {
        var defaultFormula = "D20";
        if (!error) {
            data = data || {};
            if (data[ctx.data.team_id]) {
                defaultFormula = data[ctx.data.team_id];
            }
            if (command == "default") {
                return cb(null, { text: "Your default roll is " + defaultFormula });
            }
            if (command.indexOf("default") !== -1) {
                var defaultFormula = command.replace(/default/gi, "").trim();
                if (diceValidate(defaultFormula)) {
                    data[ctx.data.team_id] = defaultFormula;
                    ctx.storage.set(data, function(error) {
                        return cb(null, { text: "Your new default is " + defaultFormula });
                    });
                } else {
                    return cb(null, { text: "I'm sorry, I can't parse " + defaultFormula + ", have you used <https://en.wikipedia.org/wiki/Dice_notation|Standard Dice Notation>? Your default has not been updated." });
                }
            } else {
                var formula = command.replace(/ /g, "");
                if (!formula) {
                    formula = defaultFormula;
                }
                var result = diceRoll(formula);
                if (!result) {
                    cb(null, { text: "I'm sorry, I can't parse " + command + ", have you used <https://en.wikipedia.org/wiki/Dice_notation|Standard Dice Notation>?" });
                } else {
                    cb(null, {
                        // "response_type": "in_channel",
                        "text": "Rolling " + formula,
                        "attachments": [{
                            "text": "Result: " + result
                        }]
                    });
                }
            }
        }
    });
}

/**
 *Using Slacks message attachments for a nicer help text
 */
function helpText(command) {
    var helpText = "" +
        "`" + command + " default` display current default\n" +
        "`" + command + " default <formula>` set default for your team to <formula>\n" +
        "`" + command + " help` show this message again!\n";
    return {
        "text": "Saving you from arithmetic since 2016!",
        "attachments": [{
            "color": "good",
            "title": "Rolling a dice",
            "text": "`" + command + "` Roll the default formula\n" +
                "`" + command + " <formula>` Get the result of the given formula (in <https://en.wikipedia.org/wiki/Dice_notation|Standard Dice Notation>)\n",
            "mrkdwn_in": [
                "text"
            ]
        }, {
            "title": "Configuring RollerBot",
            "text": helpText,
            "mrkdwn_in": [
                "text"
            ]
        }]
    }
}
/**
 * Dice Rolling code lightly modified from https://github.com/thebinarypenguin/droll
 * changes are just to bring it inline instead of as a module
 */
function DrollFormula() {
    this.numDice = 0;
    this.numSides = 0;
    this.modifier = 0;
}

function DrollResult() {
    this.rolls = [];
    this.modifier = 0;
    this.total = 0;
}

/**
 * Stringify results to be nicely human readable
 */
DrollResult.prototype.toString = function() {
    if (this.rolls.length === 1 && this.modifier === 0) {
        return this.rolls[0] + '';
    }

    if (this.rolls.length > 1 && this.modifier === 0) {
        return this.rolls.join(' + ') + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier > 0) {
        return this.rolls[0] + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier > 0) {
        return this.rolls.join(' + ') + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier < 0) {
        return this.rolls[0] + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier < 0) {
        return this.rolls.join(' + ') + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }
};

/**
 * Parse the formula to get it's constituent parts
 */
var diceParse = function(formula) {
    var pieces = null,
        result = new DrollFormula();

    pieces = formula.match(/^([1-9]\d*)?d([1-9]\d*)([+-]\d+)?$/i);
    if (!pieces) {
        return false;
    }

    result.numDice = (pieces[1] - 0) || 1;
    result.numSides = (pieces[2] - 0);
    result.modifier = (pieces[3] - 0) || 0;

    return result;
};

/**
 * Validate a formula to ensure we can calulate it
 */
var diceValidate = function(formula) {
    return (diceParse(formula)) ? true : false;
};

/**
 * Roll them dice!
 *
 */
var diceRoll = function(formula) {
    var pieces = null,
        result = new DrollResult();

    pieces = diceParse(formula);
    if (!pieces) {
        return false;
    }

    for (var a = 0; a < pieces.numDice; a++) {
        result.rolls[a] = (1 + Math.floor(Math.random() * pieces.numSides));
    }

    result.modifier = pieces.modifier;

    for (var b = 0; b < result.rolls.length; b++) {
        result.total += result.rolls[b];
    }
    result.total += result.modifier;

    return result;
};
