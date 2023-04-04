// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

	// Moo lexer documention is here:
	// https://github.com/no-context/moo

	const moo = require("moo");

        const lexer = moo.states({
                main: {
                        dot: ".",
                        regex: { match: /[rR][eE][gG][eE][xX]\(/, push: 'regex' },
                        openingBracket: "[",
                        closingBracket: "]",
                        closingBracket: "]",
                        comma: ",",
                        openP: { match: "(", push: "main" },
                        openCondBrackets: { match: /\{\%/, push: "main" },
                        closingP: { match: ")", pop: true },
                        closingCondBrackets: { match: /\%\}/, push: "main" },
                        ws:     /[ \t]+/,
                        number: /[0-9]+/,
                        matches: /[Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                        notMatches: /[Nn][Oo][Tt] [Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                        equals: /[Ee][Qq][Uu][Aa][Ll][Ss]|===|==|=/,
                        notEquals: /[Nn][Oo][Tt] [Ee][Qq][Uu][Aa][Ll][Ss]|!==|!=/,
                        relationalOperator: /<=|>=|>|</,
                        bang: "!",
                        exists:/[Ee][Xx][Ii][Ss][Tt][Ss]/,
                        inOperator:/[Ii][Nn]/,
                        notInOperator:/[Nn][Oo][Tt] [Ii][Nn]/,
                        notExists:/[Nn][Oo][Tt] [Ee][Xx][Ii][Ss][Tt][Ss]/,
                        and:/[Aa][Nn][Dd]|&&/,
                        or:/[Oo][Rr]|\|\|/,
                        "null": /[Nn][Uu][Ll][Ll]/,
                        "undefined": /[Uu][Nn][Dd][Ee][Ff][Ii][Nn][Ee][Dd]/,
                        "true": /[Tt][Rr][Uu][Ee]/,
                        "false": /[Ff][Aa][Ll][Ss][Ee]/,
                        word: /[a-zA-Z0-9_]+/,
                        sqstr: /'.*?'/,
                        dqstr: /".*?"/,
                        dcbl: { match: /{{/, push: "variable" },
                        plus: "+",
                        minus: "-",
                        multiply: "*",
                        divide: "/",
                        modulo: "%",
                },
                variable: {
                        dcbl: { match: /{{/, push: "variable" },
                        openingBracket: "[",
                        dot: ".",
                        word: /[a-zA-Z0-9_]+/,
                        sqstr: /'.*?'/,
                        dqstr: /".*?"/,
                        closingBracket: "]",
                        dcbr: { match: /}}/, pop: true }
                },

                regex: {
                        dcbl: { match: /{{/, push: "variable" },
                        closingP: { match: /\)$/, pop: true },
                        anything: { match: /[^)]+/, lineBreaks: true }
                }
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
const FunctionCall = require('./interpreter/FunctionCall').default;
const BooleanConstant = require('./interpreter/BooleanConstant').default;
const NullConstant = require('./interpreter/NullConstant').default;
const NumberConstant = require('./interpreter/NumberConstant').default;
const StringConstant = require('./interpreter/StringConstant').default;
const DateExpression = require('./interpreter/DateExpression').default;
const MathematicalExpression = require('./interpreter/MathematicalExpression').default;

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
    {"name": "expression", "symbols": ["booleanExpression"], "postprocess": id},
    {"name": "suffixOperator", "symbols": [(lexer.has("exists") ? {type: "exists"} : exists)], "postprocess": id},
    {"name": "suffixOperator", "symbols": [(lexer.has("notExists") ? {type: "notExists"} : notExists)], "postprocess": id},
    {"name": "booleanExpression", "symbols": ["equalityExpression"], "postprocess": id},
    {"name": "booleanExpression", "symbols": ["equalityExpression", (lexer.has("ws") ? {type: "ws"} : ws), "booleanOperator", (lexer.has("ws") ? {type: "ws"} : ws), "booleanExpression"], "postprocess": toConditionalExpression},
    {"name": "booleanOperator", "symbols": [(lexer.has("and") ? {type: "and"} : and)], "postprocess": id},
    {"name": "booleanOperator", "symbols": [(lexer.has("or") ? {type: "or"} : or)], "postprocess": id},
    {"name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id},
    {"name": "equalityExpression$ebnf$1", "symbols": ["insideARegEx"]},
    {"name": "equalityExpression$ebnf$1", "symbols": ["equalityExpression$ebnf$1", "insideARegEx"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "equalityExpression", "symbols": ["relationalExpression", (lexer.has("ws") ? {type: "ws"} : ws), "matchOperator", (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("regex") ? {type: "regex"} : regex), "equalityExpression$ebnf$1", (lexer.has("closingP") ? {type: "closingP"} : closingP)], "postprocess": ([left,,operator,,,right]) => toConditionalExpression([left,,operator,,right])},
    {"name": "equalityExpression", "symbols": ["relationalExpression", (lexer.has("ws") ? {type: "ws"} : ws), "equalityOperator", (lexer.has("ws") ? {type: "ws"} : ws), "equalityExpression"], "postprocess": toConditionalExpression},
    {"name": "equalityExpression", "symbols": ["relationalExpression", (lexer.has("ws") ? {type: "ws"} : ws), "suffixOperator"], "postprocess": toConditionalExpression},
    {"name": "matchOperator", "symbols": [(lexer.has("matches") ? {type: "matches"} : matches)]},
    {"name": "matchOperator", "symbols": [(lexer.has("notMatches") ? {type: "notMatches"} : notMatches)]},
    {"name": "insideARegEx", "symbols": [(lexer.has("anything") ? {type: "anything"} : anything)], "postprocess": ([value]) => value.value},
    {"name": "insideARegEx", "symbols": ["variable"], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("equals") ? {type: "equals"} : equals)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("notEquals") ? {type: "notEquals"} : notEquals)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("matches") ? {type: "matches"} : matches)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("notMatches") ? {type: "notMatches"} : notMatches)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("inOperator") ? {type: "inOperator"} : inOperator)], "postprocess": id},
    {"name": "equalityOperator", "symbols": [(lexer.has("notInOperator") ? {type: "notInOperator"} : notInOperator)], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["unaryExpression"], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["unaryExpression", (lexer.has("ws") ? {type: "ws"} : ws), (lexer.has("relationalOperator") ? {type: "relationalOperator"} : relationalOperator), (lexer.has("ws") ? {type: "ws"} : ws), "relationalExpression"], "postprocess": toConditionalExpression},
    {"name": "unaryExpression", "symbols": ["boolean"], "postprocess": ([value]) => new BooleanConstant(value)},
    {"name": "unaryExpression", "symbols": ["nullLiteral"], "postprocess": ([value]) => new NullConstant(value)},
    {"name": "unaryExpression", "symbols": ["undefinedLiteral"], "postprocess": ([value]) => new Variable(value)},
    {"name": "unaryExpression", "symbols": ["number"], "postprocess": ([value]) => new NumberConstant(value)},
    {"name": "unaryExpression", "symbols": ["string"], "postprocess": ([value]) => new StringConstant(value)},
    {"name": "unaryExpression", "symbols": ["variable"], "postprocess": id},
    {"name": "unaryExpression", "symbols": [(lexer.has("bang") ? {type: "bang"} : bang), "_", "unaryExpression"], "postprocess": ([,,node]) => new NegationExpression(node)},
    {"name": "unaryExpression", "symbols": [(lexer.has("openP") ? {type: "openP"} : openP), "_", "expression", "_", (lexer.has("closingP") ? {type: "closingP"} : closingP)], "postprocess": d => d[2]},
    {"name": "unaryExpression", "symbols": [(lexer.has("openCondBrackets") ? {type: "openCondBrackets"} : openCondBrackets), "_", "expression", "_", (lexer.has("closingCondBrackets") ? {type: "closingCondBrackets"} : closingCondBrackets)], "postprocess": d => d[2]},
    {"name": "unaryExpression", "symbols": ["functionCall"], "postprocess": id},
    {"name": "unaryExpression", "symbols": ["mathematicalExpression"], "postprocess": id},
    {"name": "variable", "symbols": [(lexer.has("dcbl") ? {type: "dcbl"} : dcbl), "_", "variablePath", "_", (lexer.has("dcbr") ? {type: "dcbr"} : dcbr)], "postprocess": ([,,path]) => new Variable(path)},
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
    {"name": "functionParams", "symbols": [], "postprocess": () => []},
    {"name": "functionParams", "symbols": ["_", "unaryExpression", "_"], "postprocess": d => [d[1]]},
    {"name": "functionParams", "symbols": ["_", "unaryExpression", "_", {"literal":","}, "functionParams"], "postprocess": 
        d => [d[1], ...d[4]]
                },
    {"name": "optionalResultSubkey", "symbols": [], "postprocess": () => null},
    {"name": "optionalResultSubkey", "symbols": [{"literal":"."}, (lexer.has("word") ? {type: "word"} : word)], "postprocess": d => d[1].value},
    {"name": "functionCall", "symbols": [(lexer.has("word") ? {type: "word"} : word), {"literal":"("}, "functionParams", {"literal":")"}, "optionalResultSubkey"], "postprocess": 
        d => new FunctionCall({
            functionName: d[0].value,
            arguments: d[2],
            resultKey: d[4]
        })
                },
    {"name": "mathematicalExpression", "symbols": ["_", "AdditionSubstraction", "_"], "postprocess": data => data[1]},
    {"name": "AdditionSubstraction", "symbols": ["AdditionSubstraction", "_", {"literal":"+"}, "_", "ModuloMultiplyDivide"], "postprocess": data => new MathematicalExpression({ leftTerm: data[0], op: data[2].value, rightTerm: data[4] })},
    {"name": "AdditionSubstraction", "symbols": ["AdditionSubstraction", "_", {"literal":"-"}, "_", "ModuloMultiplyDivide"], "postprocess": data => new MathematicalExpression({ leftTerm: data[0], op: data[2].value, rightTerm: data[4] })},
    {"name": "AdditionSubstraction", "symbols": ["ModuloMultiplyDivide"], "postprocess": id},
    {"name": "ModuloMultiplyDivide", "symbols": ["ModuloMultiplyDivide", "_", {"literal":"%"}, "_", "Parenthesized"], "postprocess": data => new MathematicalExpression({ leftTerm: data[0], op: data[2].value, rightTerm: data[4] })},
    {"name": "ModuloMultiplyDivide", "symbols": ["ModuloMultiplyDivide", "_", {"literal":"*"}, "_", "Parenthesized"], "postprocess": data => new MathematicalExpression({ leftTerm: data[0], op: data[2].value, rightTerm: data[4] })},
    {"name": "ModuloMultiplyDivide", "symbols": ["ModuloMultiplyDivide", "_", {"literal":"/"}, "_", "Parenthesized"], "postprocess": data => new MathematicalExpression({ leftTerm: data[0], op: data[2].value, rightTerm: data[4] })},
    {"name": "ModuloMultiplyDivide", "symbols": ["Parenthesized"], "postprocess": id},
    {"name": "Parenthesized", "symbols": [(lexer.has("openP") ? {type: "openP"} : openP), "_", "mathematicalExpression", "_", (lexer.has("closingP") ? {type: "closingP"} : closingP)], "postprocess": data => data[2]},
    {"name": "Parenthesized", "symbols": ["Term"], "postprocess": id},
    {"name": "Term", "symbols": ["number"], "postprocess": ([value]) => new NumberConstant(value)},
    {"name": "Term", "symbols": ["variable"], "postprocess": id},
    {"name": "Term", "symbols": ["functionCall"], "postprocess": id},
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
