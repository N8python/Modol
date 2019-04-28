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
    const func = function(number) {
        return formatModulus(number, modulend, name);
    }
    func.modname = name;
    return func;
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

function formatMods(arr, format) {
    return format.replace(/&([A-Za-z\$][A-Za-z0-9\$]*)/g, (match, p1) => {
        return arr.find(str => str.includes(p1));
    }).replace(/\*([A-Za-z$][A-Za-z0-9$]*)/g, (match, p1) => {
        return parseInt(arr.find(str => str.includes(p1)));
    });
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
         */
    add(...extensions) {
            let res = new Modol(this.name, this.keys, false);
            extensions.forEach(extension => {
                if (typeof extension === "function") {
                    res = extension(res);
                } else if (Array.isArray(extension)) {
                    res = extension[0](res, extension[1]);
                }
            });
            return res;
        }
        /**
         * 
         * @param {number} number 
         * @param {{withOxford ?: boolean, maxUnit ?: string}}  spec
         * @return {string}
         */
    format(number, spec = {}) {
            const { withOxford, maxUnit, minUnit, format } = spec;
            const firstMod = partialModulus(1, this.name);
            let otherMods = [];
            Object.keys(this.keys).forEach(key => {
                otherMods.push(partialModulus(this.keys[key], key));
            });
            otherMods.reverse();
            if (maxUnit) {
                otherMods = otherMods.slice(otherMods.indexOf(otherMods.find(mod => mod.modname === maxUnit)));
            }
            if (minUnit) {
                otherMods = otherMods.slice(0, otherMods.indexOf(otherMods.find(mod => mod.modname === minUnit)) + 1);
            }
            const result = format ? formatMods(minUnit ? stringFormatted(number, ...otherMods) : stringFormatted(number, ...otherMods, firstMod), format) : formatArray(minUnit ? stringFormatted(number, ...otherMods) : stringFormatted(number, ...otherMods, firstMod));
            if (withOxford === true) {
                return result.replace(/\sand(.+)/, ", and$1");
            }
            return result;
        }
        /**
         * 
         * @param {string} name 
         * @param {(res: string, spec: any) => string} callback 
         * @returns {(modol: Modol | {format: (number: number) => string}, spec: any) => {format: (number: number, spec: {withOxford ?: boolean, maxUnit ?: string}) => string}}
         */
    static extend(name, callback) {
        this[name] = function(modol, spec) {
            return {
                format(number, specFormat) {
                    let res = modol.format(number, specFormat);
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

Modol.extend("withOxford", (res, spec) => {
    return res.replace(/\sand(.+)/, ", and$1");
});

Modol.extend("commaBeforeAnd", (res, spec) => {
    return res.replace(/\sand(.+)/, ", and$1");
});

module.exports = Modol;