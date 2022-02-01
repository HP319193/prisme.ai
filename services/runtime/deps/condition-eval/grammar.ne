@{%
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
                sqstr: /'.*?'/,
                dqstr: /".*?"/,
                dcbl: /{{/,
                dcbr: /}}/
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
        | relationalExpression %ws equalityOperator %ws equalityExpression {% toConditionalExpression %}
equalityOperator -> %equals {% id %} | %notEquals {% id %} | %matches {% id %} | %notMatches {% id %} 

relationalExpression ->
        unaryExpression {% id %}
        | unaryExpression %ws %relationalOperator %ws relationalExpression {% toConditionalExpression %}

unaryExpression ->
        boolean {% ([value]) => new BooleanConstant(value) %}
        | nullLiteral {% ([value]) => new NullConstant(value) %}
        | undefinedLiteral {% ([value]) => new Variable(value) %}
        | number {% ([value]) => new NumberConstant(value) %}
        | string {% ([value]) => new StringConstant(value) %}
        | %dcbl _ variablePath _ %dcbr {% ([,,path]) => new Variable(path)  %}
        | %bang _ expression {% ([,,node]) => new NegationExpression(node) %}
        | "(" _ expression _ ")" {% d => d[2] %}

variablePath ->
        %word {% id %}
		| variablePath %openingBracket expression %closingBracket {% d => [...arrayify(d[0]), d[2]] %}
        | variablePath _ %dot _ %word {% d => [...arrayify(d[0]), d[4]] %}

string ->
        %dqstr {% retrieveActualString(`"`) %}
        | %sqstr {% retrieveActualString(`'`) %}
        | %word {% ([value]) => `${value}`  %}

number -> jsonfloat {% id %}
boolean -> %true {% () => true %} | %false {% () => false %}
nullLiteral -> %null {% () => null %}
undefinedLiteral -> %undefined {% () => undefined %}

_ -> [\s]:* {% () => null %}