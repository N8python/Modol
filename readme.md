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

## The *Comma Before And* Extension

Another common controversy is whether a comma should go before the "and". Modol, by default, does not place the comma before the and. However, we have an extension that does:

```js
const myLittleModol = Modol.commaBeforeAnd(new Modol("little", {
    big: 25
}))
myLittleModol.format(87); // '3 bigs, and 12 littles' - Yay, a comma before the and!
```

The Comma Before And Extension dosen't take a specification. If you supply one, it will be discarded.

## Stacking extensions
Let's say you wanted to combine the effects of the Plurals and Comma Before And extension. You can pass the results of one extension to another, so you can do something like this:
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

# Features Coming Soon
- Better Modol Extension Stacking

Enjoy!
