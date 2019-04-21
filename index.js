function formatModulus(number, modulend, name) {
    let quo = Math.floor(number / modulend);
    let rem = number % modulend;
    let res = `${quo} ${name}${(quo > 1) ? "s" : ""}`;
    return {
        quo,
        rem,
        res
    };
}

function partialModulus(modulend, name) {
    return function(number) {
        return formatModulus(number, modulend, name);
    }
}

function stringFormatted(number, first, ...others) {
    if (first) {
        first = first(number);
        return [first.res].concat(stringFormatted(first.rem, ...others));
    }
    return "";
}

function formatArray(arr) {
    arr = arr.filter(i => i[0] !== "0" && i);
    let seperators = ", |".repeat(Math.max(arr.length - 2, 0)).split("|");
    if (arr.length !== 1) seperators[seperators.length - 1] = " and ";
    let res = "";
    arr.forEach((name, index) => {
        res += name;
        if (seperators[index]) res += seperators[index]
    });
    res = res.replace(/\s+/, " ");
    return res;
}
class Modol {
    /**
     * 
     * @param {string} name 
     * @param {{[key: string] : number}} keys 
     * @param {boolean} stack 
     */
    constructor(name, keys, stack = false) {
            this.name = name;
            this.keys = keys;
            if (stack) {
                Object.keys(this.keys).forEach((key, index) => {
                    if (index > 0) this.keys[key] = this.keys[key] * this.keys[Object.keys(this.keys)[index - 1]]
                })
            }
        }
        /**
         * 
         * @param {number} number 
         * @return {string}
         */
    format(number) {
            const firstMod = partialModulus(1, this.name);
            let otherMods = [];
            Object.keys(this.keys).forEach(key => {
                otherMods.push(partialModulus(this.keys[key], key));
            });
            otherMods.reverse();
            return formatArray(stringFormatted(number, ...otherMods, firstMod))
        }
        /**
         * 
         * @param {string} name 
         * @param {(res: string, spec: any) => string} callback 
         * @returns {(modol: Modol | {format: (number: number) => string}, spec: any) => {format: (number: number) => string}}
         */
    static extend(name, callback) {
        this[name] = function(modol, spec) {
            return {
                format(number) {
                    let res = modol.format(number);
                    res = callback(res, spec);
                    return res;
                }
            }
        }
    }
}
Modol.extend("plurals", (res, spec) => {
    let plurals = Object.entries(spec).map(entry => [entry[0] + "s", entry[1]])
    plurals.forEach(plural => {
        res = res.replace(new RegExp(plural[0], "g"), plural[1]);
    });
    return res;
});

Modol.extend("commaBeforeAnd", (res, spec) => {
    return res.replace(/\sand(.+)/, ", and$1");
});

module.exports = Modol;