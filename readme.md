# What is Modol?

Quite bluntly, "Modol" is just a combination of the words "Modulus" and "Model" (where the "e" and "u" are combined to the "o").

And that is exactly what Modol is: a way of modeling (or templating) with the modulus operator. It allows you to take a raw number, (say the number of millseconds since 1970 - THANK YOU Date.now()), and pretty-print it in exactly the way you like.

# Config

To start, install Modol with:
```
$ npm i modol --save
```
Then, import it with: 
```js
const Modol = require("modol");
```
Now that Modol is set up, how to use it?

# Usage

Modol, at heart, is a very simple library, with only one class being exported. However, the things you can do with it are many.

Let's start with a basic problem. You're programming a video game (if you are not a video game dev, just pretend you are), and you want to create a display that shows how many gallons of water the player has. However, the player collects water in ounces, and across the game, the player could be getting thousands of ounces of water.

Does "58672 ounces of water" look all that nice?

I don't think so. The good news is, Modol has got you covered. The following code (assumming Modol is imported) fixes the entire problem:
```js

let playerOunces = 58627;
const ImperialVolume = new Modol("ounce", {
  cup: 8,
  pint: 2,
  quart: 2,
  gallon: 4
}, true);
ImperialVolume.format(playerOunces); // '458 gallons and 3 ounces' - much better.
playerOunces += 8234; 
ImperialVolume.format(playerOunces); // '522 gallons, 1 quart, 1 cup and 5 ounces' - So many different units! All seemlessly stitched together!
```
So, what exactly is going on here?

# The Modol Constructor

The model constructor accepts three parameters. Let's talk about the first one:

## The Base Unit

The base unit is the name of unit the entrie scale is based on. For example, if you are making a date formater, the basic unit might be "second". Everything is based off this base unit. (Make sure the base unit is not plural)
```js
const myModol = new Modol([base unit]);
```
## The Scale

A base unit wouldn't be very good on it's own, right?
You can use the SCALE to help you with that.
(Make sure each unit is not plural)
Look below:
```js
const time = new Modol("second", {
    minute: 60, // A minute is 60 seconds
    hour: 3600 // An hour is 3600 seconds
});
```
Then, you can have your modol format a number of seconds with the ```format``` method:
```js
time.format(349034); // '96 hours, 57 minutes and 14 seconds' - How Pretty!
```

## The Legendary Third "Stack" Parameter

Let's say, we want to extend the example above to support days, weeks, and years.

We soon run into questions like: How many seconds are in a day, a week, a year?

So, we must bust out a calculator, and waist 5 minutes of valuable development time? NOPE!

The third parameter (when set to ```true```) makes unit conversions "stack":
```js
const time = new Modol("second", {
    minute: 60, //A minute is 60 seconds - So far the same as last time.
    hour: 60, //An hour is 60 minutes - That is so much more readable than the number 3600!
    day: 24, //A day is 24 hours...
    week: 7, //A week is seven days...
    year: 52 //And a year is 52 weeks! That was so easy and readable.
}, true);
```
As you can see, this format is easier to write and read. So, it is the standard to always set the third parameter to true, if you have units that are a multiple of the last unit in the chain.

As you can see, the new style works perfectly. Let's have it tell us the time since 1970...

```js
time.format(Date.now() / 1000); // '49 years, 24 weeks, 2 days, 2 hours, 9 minutes and 35 seconds' - That was so easy!
```

# Going Beyond

Modol has always been about simplicity. However, one class isn't enough to cover all of your formatting needs. Let's say that we want to extend the example above to include decades and centuries. We could do something like this:
```js
const time = new Modol("second", {
    minute: 60,
    hour: 60,
    day: 24,
    week: 7,
    year: 52,
    decade: 10,
    century: 10
}, true);
```
However, while this will work, things will go wrong. Modol's "plularizer" just sticks an "s" on the end of the word, so you get something like:
```js
DateFormat.format(7283722222); // '2 centurys, 3 decades, 1 year, 31 weeks, 1 day, 8 hours, 10 minutes and 22 seconds' - Don't want to put that into production!
```
Before Modol Extensions, you were stuck with that. But now,you can use the power of EXTENSIONS for templating. 

# Extensions
The Modol Library ships with two extensions.

## The Plurals Extension
This extension allows you to define plurals explicitly for certain units. Below is a fixed version of the Modol above:
```js
const time = Modol.plurals(new Modol("second", {
  minute: 60,
  hour: 60,
  day: 24,
  week: 7,
  year: 52,
  decade: 10,
  century: 10
}, true), {
  century: "centuries"
});
```
That looks good! And if we try it out:
```js
DateFormat.format(7283722222); // '2 centuries, 3 decades, 1 year, 31 weeks, 1 day, 8 hours, 10 minutes and 22 seconds' - Don't want to put that into production!
```
So, how does the extension work? It's a static function called ```plurals``` on ```Modol```, that takes a ```Modol``` instance as a parameter, and then a specification, which in this case is an object literal containing words with special suffixes. 

## The withOxford Extension

Another common controversy is whether a comma should go before the "and". This comma is known as the oxford comma. Modol, by default, does not place the oxford comma. However, we have an extension that does:

```js
const myLittleModol = Modol.withOxford(new Modol("little", {
    big: 25
}))
myLittleModol.format(87); // '3 bigs, and 12 littles' - Yay, a comma before the and!
```

The withOxford extension dosen't take a specification. If you supply one, it will be discarded.

## Stacking extensions
Let's say you wanted to combine the effects of the Plurals and Comma Before And extension. You can pass the results of one extension to another, so you can do something like this:
```js
const time = Modol.withOxford(Modol.plurals(new Modol("second", {
  minute: 60,
  hour: 60,
  day: 24,
  week: 7,
  year: 52,
  decade: 10,
  century: 10
}, true), {
  century: "centuries"
}));
```
Then, whenever you use it, the effects of both extensions will be combined:
```js
time.format(7283722222); // '2 centuries, 3 decades, 1 year, 31 weeks, 1 day, 8 hours, 10 minutes, and 22 seconds' - The effects were combined!
```

## Making your own extensions
Where extensions really shine is the fact that you can create them yourself, with ```Modol```'s static method ```extend```. In fact, the two extensions that ship with Modol are actually built with that very method!

So, how do we use it? Let's say we want to built a simple extension that converts the results of any Modol to uppercase.

Let's call ```Modol.extend```, and supply the first parameter, (the name of our extension).

```js
Model.extend("uppercase");
```

Now, we must supply the second parameter, a callback function. The callback takes two parameters, the first being the result of the extended Modol, and the second is the specification (our extension dosen't care about it, but extensions like the plurals extension do). Then, our callback returns the value that will be returned from the ```format``` function.

```js
Modol.extend("uppercase", (res, spec) => {
    return res.toUpperCase();
});
```

Now, let's try it out:
```js
const ImperialVolume = Modol.uppercase(new Modol("ounce", {
  cup: 8,
  pint: 2,
  quart: 2,
  gallon: 4
}, true));
ImperialVolume.format(23) // '1 PINT AND 7 OUNCES' - It worked!
```

# Modol 0.2.x features
- Note that the main features for this release were the ideas of NSFWJamieVardy on reddit
## Compatibility from older versions
The Modol extension ```beforeAnd``` is now deprecated. It has been renamed to ```withOxford```. While ```beforeAnd``` still works, use ```withOxford``` in all cases.

Modol went though a big change when version 0.2.3 came out. The major feature addition is extension stacking, which is a more elegant way to add extensions to your Modol.

## Extension Stacking

Let's look at an example from before:
```js
const time = Modol.commaBeforeAnd(Modol.plurals(new Modol("second", {
  minute: 60,
  hour: 60,
  day: 24,
  week: 7,
  year: 52,
  decade: 10,
  century: 10
}, true), {
  century: "centuries"
}));
```

This looks flat out messy. Luckiy, Modol comes with a new instance method, ```add```, that makes adding extensions MUCH easier.
You can rewrite the verbose example above to the elegant example below:
```js
const time = new Modol("second", {
  minute: 60,
  hour: 60,
  day: 24,
  week: 7,
  year: 52,
  decade: 10,
  century: 10
}, true).add([
  Modol.plurals,
  {
    century: "centuries"
  }
], Modol.withOxford);
```
The ```add``` method takes an unlimited number of arguments. It iterates of each argument in insertion order, and if that argument is an extension, it calls it on the original Modol without passing any specification. If the argument is an array, it calls the first element of the array on the original Modol, and passes the second element in the array as specification.

## Other features
While extension stacking is the best cosmetic feature added in Modol 0.2.x, there two more that you can enjoy. Both of them lie in the ```format``` method's new optional parameter. A object with formatting specification, allowing you to customize the behavior of your Modol not only on creation, but each time you use it to format something.
```js
// The old format method
Modol.format(number);
// The new format method
Modol.format(number, {
  config...
});
```
### The Oxford Comma on Format
The word "extension" is something meant for BIG things. IMPORTANT things. NOT COMMAS. Before Modol 0.2.x, the oxford comma extension WAS AN EXTENSION, because there was no other way to modify your Modol. Now, the oxford comma is a formatting specification. You don't need to add the extension, you can pass it along as a specification parameter:
```js
// Before:
myModol.format(999); // If you wanted that oxford comma, you had to extend the whole modol.
// After:
myModol.format(999, {
  withOxford: true
}); // You can change if you have the oxford comma across format calls - how flexible!
```
However, if you set the ```withOxford``` specification to ```true`` on a Modol already extending the withOxford EXTENSION, then you will end up with two oxford commas - This could be fixed in a coming version.

### Max Unit
The most technically useful feature of Modol 0.2.x is the maxUnit config parameter. Let's say you have the ```time``` Modol from before:

```js
const time = new Modol("second", {
    minute: 60,
    hour: 60,
    day: 24,
    week: 7,
    year: 52
}, true);
```

Let's say you have a change of heart, and rather than displaying time in years all around your website, you also want to display it in days. Before Modol 0.2.x, this would have meant going through the trouble of creating a new Modol. Now, you can do this with another specification parameter, ```maxUnit```:

```js
time.format(999, {
  maxUnit: "day"
});
```

This means that Modol will discard the week and year units just for this format call, and you will get a nice and beautiful date, with only days, hours, minutes and seconds. 

A side note - You can pass as many specification parameters to format as you would like, and there effects will be combined (So you can limit the units a format call uses AND have that beautiful oxford comma).

## 0.2.2 specification parameters

In release 0.2.2, two additional specification parameters were added:

### Min unit
Max unit was useful, as it allowed modification of a Modol during formatting. But what about the other side of the coin? Min unit has arrived, allowing you to specify the smallest unit you need. It works exactly like you think it does:
```js
const time = new Modol("second", {
  minute: 60,
  hour: 60,
  day: 24
}, true);


time.format(394304) // '4 days, 13 hours, 31 minutes and 44 seconds'

time.format(394304, {
  maxUnit: "hour"
}); // '109 hours, 31 minutes and 44 seconds'

time.format(394304, {
  maxUnit: "hour",
  minUnit: "minute"
}); // '109 hours and 31 minutes'
```

An important thing to note is that the minUnit specification parameter truncates any units smaller than the minUnit, and does not perform rounding. (So "31 minutes, 44 seconds", does not become "32 minutes", but "31 minutes").

### Formatting the format call
A new specification parameter has been added called "format". It allows you to change the output of your Modol by specifying a different string to return, and allows you to reference each of your individual units. 

Let's take the time Modol above. Let's say we are making a video game, and we want to format the time Modol as "It's day number {number of days}. {hours}, {minutes}, and {seconds} have passed."

First, you can use the & sign to reference the string of text that each unit will become. Ex (using the time Modol from above):
```js
time.format(394304, {
  format: "It's day number &day. &hour, &minute, and &second have passed."
}); // "It's day number 4 days. 13 hours, 31 minutes, and 44 seconds have passed."
```
That looks great! Except, rather than showing the number of days, format outputs the entire day string: "4 days". We need to use the * symbol to extract just the NUMBER of days:
```js
time.format(394304, {
  format: "It's day number *day. &hour, &minute, and &second have passed."
}); // "It's day number 4. 13 hours, 31 minutes, and 44 seconds have passed."
```
If anyone releases that Modol format strings look like pointers in C, that was intentional.
# Features Coming soon(er or later)
- I don't have any ideas right now...
Enjoy!
