@{%
	// Moo lexer documention is here:
	// https://github.com/no-context/moo

	const moo = require("moo");

        const lexer = moo.states({
                main: {
                        dot: ".",
                        regex: { match: /[rR][eE][gG][eE][xX]\(/, push: 'regex' },
                        date: { match: /[dD][aA][tT][eE]\(/, push: 'date' },
                        openingBracket: "[",
                        closingBracket: "]",
                        openP: { match: "(", push: "main" },
                        closingP: { match: ")", pop: true },
                        ws:     /[ \t]+/,
                        number: /[0-9]+/,
                        matches: /[Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                        notMatches: /[Nn][Oo][Tt] [Mm][Aa][Tt][Cc][Hh][Ee][Ss]/,
                        equals: /[Ee][Qq][Uu][Aa][Ll][Ss]|===|==/,
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
                },
                variable: {
                        dcbl: { match: /{{/, push: "variable" },
                        openingBracket: "[",
                        dot: ".",
                        word: /[a-zA-Z0-9_]+/,
                        closingBracket: "]",
                        dcbr: { match: /}}/, pop: true }
                },
                regex: {
                        dcbl: { match: /{{/, push: "variable" },
                        closingP: { match: /\)$/, pop: true },
                        anything: { match: /[^)]+/, lineBreaks: true }
                },
                date: {
                        dcbl: { match: /{{/, push: "variable" },
                        closingP: { match: /\)/, pop: true },
                        word: /[a-zA-Z0-9_:.-]+/,
                        sqstr: /'.*?'/,
                        dqstr: /".*?"/,
                        anything: { match: /[^)]+/, lineBreaks: true }
                }
        });
%}

# Pass your lexer with @lexer:
@lexer lexer

@builtin "number.ne"
@builtin "string.ne"
@builtin "postprocessors.ne"

@{%
const Variable = require('./interpreter/Variable').default;
const ConditionalExpression = require('./interpreter/ConditionalExpression').default;
const NegationExpression = require('./interpreter/NegationExpression').default;
const BooleanConstant = require('./interpreter/BooleanConstant').default;
const NullConstant = require('./interpreter/NullConstant').default;
const NumberConstant = require('./interpreter/NumberConstant').default;
const StringConstant = require('./interpreter/StringConstant').default;
const DateExpression = require('./interpreter/DateExpression').default;

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
%}

main -> expression {% id %}

expression -> suffixedExpression {% id %}

suffixedExpression -> booleanExpression {% id %} | booleanExpression %ws suffixOperator {% toConditionalExpression %}
suffixOperator -> %exists {% id %} | %notExists {% id %}

booleanExpression ->
        equalityExpression {% id %}
        | equalityExpression %ws booleanOperator %ws booleanExpression {% toConditionalExpression %}
booleanOperator -> %and {% id %} | %or {% id %}

equalityExpression ->
        relationalExpression {% id %}
        | relationalExpression %ws matchOperator %ws %regex insideARegEx:+ %closingP {% ([left,,operator,,,right]) => toConditionalExpression([left,,operator,,right]) %}
        | relationalExpression %ws equalityOperator %ws equalityExpression {% toConditionalExpression %}

matchOperator -> %matches | %notMatches
insideARegEx -> %anything {% ([value]) => value.value %} | variable {% id %}

equalityOperator -> %equals {% id %} | %notEquals {% id %} | %matches {% id %} | %notMatches {% id %} | %inOperator {% id %} | %notInOperator {% id %}

relationalExpression ->
        unaryExpression {% id %}
        | unaryExpression %ws %relationalOperator %ws relationalExpression {% toConditionalExpression %}

unaryExpression ->
        boolean {% ([value]) => new BooleanConstant(value) %}
        | nullLiteral {% ([value]) => new NullConstant(value) %}
        | undefinedLiteral {% ([value]) => new Variable(value) %}
        | number {% ([value]) => new NumberConstant(value) %}
        | string {% ([value]) => new StringConstant(value) %}
        | date {% ([value]) => new DateExpression(value) %}
        | variable {% id %}
        | %bang _ unaryExpression {% ([,,node]) => new NegationExpression(node) %}
        | %openP _ expression _ %closingP {% d => d[2] %}

variable -> %dcbl _ variablePath _ %dcbr {% ([,,path]) => new Variable(path)  %}

variablePath ->
        %word {% id %}
		| variablePath %openingBracket expression %closingBracket {% d => [...arrayify(d[0]), d[2]] %}
        | variablePath _ %dot _ %word {% d => [...arrayify(d[0]), d[4]] %}

insideADate -> string {% id %} | variable {% id %}
date ->
        %date insideADate %closingP %dot %word {% ([, date, , , elem]) => [date, elem.value] %}
        | %date insideADate %closingP {% ([, date]) => [date] %}
string ->
        %dqstr {% retrieveActualString(`"`) %}
        | %sqstr {% retrieveActualString(`'`) %}
        | %word {% ([value]) => `${value}`  %}

number -> jsonfloat {% id %}
boolean -> %true {% () => true %} | %false {% () => false %}
nullLiteral -> %null {% () => null %}
undefinedLiteral -> %undefined {% () => undefined %}

_ -> [\s]:* {% () => null %}
