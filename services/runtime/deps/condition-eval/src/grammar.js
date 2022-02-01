// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

	// Moo lexer documention is here:
	// https://github.com/no-context/moo

	const moo = require("moo");

	const lexer = moo.compile({
                dot: ".",
                openingBracket: "[",
                closingBracket: "]",
                openP: "(",
                closingP: ")",
                ws:     /[ \t]+/,
                number: /[0-9]+/,
                matches: /[Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                notMatches: /[Nn][Oo][Tt] [Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                equals: /[Ee][Qq][Uu][Aa][Ll][Ss]|===|==/,
                notEquals: /[Nn][Oo][Tt] [Ee][Qq][Uu][Aa][Ll][Ss]|!==|!=/,
                relationalOperator: /<=|>=|>|</,
                bang: "!",
                exists:/[Ee][Xx][Ii][Ss][Tt][Ss]/,
                notExists:/[Nn][Oo][Tt] [Ee][Xx][Ii][Ss][Tt][Ss]/,
                and:/[Aa][Nn][Dd]|&&/,
                or:/[Oo][Rr]|\|\|/,
                "null": /[Nn][Uu][Ll][Ll]/,
                "undefined": /[Uu][Nn][Dd][Ee][Ff][Ii][Nn][Ee][Dd]/,	
                "true": /[Tt][Rr][Uu][Ee]/,	
                "false": /[Ff][Aa][Ll][Ss][Ee]/,
                word: /[a-zA-Z0-9_]+/,
                sqstr: /'[a-zA-Z ]*'/,
                dqstr: /"[a-zA-Z ]*"/,
                dcbl: /{{/,
                dcbr: /}}/
	});


// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function nth(n) {
    return function(d) {
        return d[n];
    };
}


// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function $(o) {
    return function(d) {
        var ret = {};
        Object.keys(o).forEach(function(k) {
            ret[k] = d[o[k]];
        });
        return ret;
    };
}


const Variable = require('./interpreter/Variable').default;
const ConditionalExpression = require('./interpreter/ConditionalExpression').default;
const NegationExpression = require('./interpreter/NegationExpression').default;
const BooleanConstant = require('./interpreter/BooleanConstant').default;
const NullConstant = require('./interpreter/NullConstant').default;
const NumberConstant = require('./interpreter/NumberConstant').default;
const StringConstant = require('./interpreter/StringConstant').default;

const arrayify = item => Array.isArray(item) ? item : [item];
const joinFirst =
  (seperator = "") =>
  ([items]) =>
    items.join(seperator);

const joinAll =
  (seperator = "") =>
  (items) =>
    items.join(seperator);

const retrieveActualString = (seperator = "'") => ([value]) =>  { const [,group] = new RegExp(`${seperator}(.*)${seperator}`).exec(value); return group; }

const toConditionalExpression = (items) => new ConditionalExpression(items[0], items[4], items[2]);
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "main", "symbols": ["expression"], "postprocess": id},
    {"name": "expression", "symbols": ["suffixedExpression"], "postprocess": id},
    {"name": "suffixedExpression", "symbols": ["booleanExpression"], "postprocess": id},
    {"name": "suffixedExpression", "symbols": ["booleanExpression", (lexer.has("ws") ? {type: "ws"} : ws), "suffixOperator"], "postprocess": toConditionalExpression},
    {"name": "suffixOperator", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists)], "postprocess": id},
    {"name": "suffixOperator", "symbols": [(lexer.has("notExists") ? {type: "notExists"} : notExists)], "postprocess": id},
    {"name": "booleanExpression", "symbols": ["equalityExpression"], "postprocess": id},
    {"name": "booleanExpression", "symbols": ["equalityExpression", (lexer.has("ws") ? {type: "ws"} : ws), "booleanOperator", (lexer.has("ws") ? {type: "ws"} : ws), "booleanExpression"], "postprocess": toConditionalExpression},
    {"name": "booleanOperator", "symbols": [(lexer.has("and") ? {type: "and"} : and)], "postprocess": id},
    {"name": "booleanOperator", "symbols": [(lexer.has("or") ? {type: "or"} : or)], "postprocess": id},
    {"name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id},
    {"name": "equalityExpression", "symbols": ["relationalExpression", (lexer.has("ws") ? {type: "ws"} : ws), "equalityOperator", (lexer.has("ws") ? {type: "ws"} : ws), "equalityExpression"], "postprocess": toConditionalExpression},
    {"name": "equalityOperator", "symbols": [(lexer.has("equals") ? {type: "equals"} : equals)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("notEquals") ? {type: "notEquals"} : notEquals)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("matches") ? {type: "matches"} : matches)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("notMatches") ? {type: "notMatches"} : notMatches)], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["unaryExpression"], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["unaryExpression", (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("relationalOperator") ? {type: "relationalOperator"} : relationalOperator), (lexer.has("ws") ? {type: "ws"} : ws), "relationalExpression"], "postprocess": toConditionalExpression},
    {"name": "unaryExpression", "symbols": ["boolean"], "postprocess": ([value]) => new BooleanConstant(value)},
    {"name": "unaryExpression", "symbols": ["nullLiteral"], "postprocess": ([value]) => new NullConstant(value)},
    {"name": "unaryExpression", "symbols": ["undefinedLiteral"], "postprocess": ([value]) => new Variable(value)},
    {"name": "unaryExpression", "symbols": ["number"], "postprocess": ([value]) => new NumberConstant(value)},
    {"name": "unaryExpression", "symbols": ["string"], "postprocess": ([value]) => new StringConstant(value)},
    {"name": "unaryExpression", "symbols": [(lexer.has("dcbl") ? {type: "dcbl"} : dcbl), "_", "variablePath", "_", (lexer.has("dcbr") ? {type: "dcbr"} : dcbr)], "postprocess": ([,,path]) => new Variable(path)},
    {"name": "unaryExpression", "symbols": [(lexer.has("bang") ? {type: "bang"} : bang), "_", "expression"], "postprocess": ([,,node]) => new NegationExpression(node)},
    {"name": "unaryExpression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": d => d[2]},
    {"name": "variablePath", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": id},
    {"name": "variablePath", "symbols": ["variablePath", (lexer.has("openingBracket") ? {type: "openingBracket"} : openingBracket), "expression", (lexer.has("closingBracket") ? {type: "closingBracket"} : closingBracket)], "postprocess": d => [...arrayify(d[0]), d[2]]},
    {"name": "variablePath", "symbols": ["variablePath", "_", (lexer.has("dot") ? {type: "dot"} : dot), "_", (lexer.has("word") ? {type: "word"} : word)], "postprocess": d => [...arrayify(d[0]), d[4]]},
    {"name": "string", "symbols": [(lexer.has("dqstr") ? {type: "dqstr"} : dqstr)], "postprocess": retrieveActualString(`"`)},
    {"name": "string", "symbols": [(lexer.has("sqstr") ? {type: "sqstr"} : sqstr)], "postprocess": retrieveActualString(`'`)},
    {"name": "string", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": ([value]) => `${value}`},
    {"name": "number", "symbols": ["jsonfloat"], "postprocess": id},
    {"name": "boolean", "symbols": [(lexer.has("true") ? {type: "true"} : true)], "postprocess": () => true},
    {"name": "boolean", "symbols": [(lexer.has("false") ? {type: "false"} : false)], "postprocess": () => false},
    {"name": "nullLiteral", "symbols": [(lexer.has("null") ? {type: "null"} : null)], "postprocess": () => null},
    {"name": "undefinedLiteral", "symbols": [(lexer.has("undefined") ? {type: "undefined"} : undefined)], "postprocess": () => undefined},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
