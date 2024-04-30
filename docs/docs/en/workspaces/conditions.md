# Conditions

[Condition](../instructions#conditions) instructions allows to execute different instructions depending on contextual informations such as the user age, an input form value, ...  

These conditions are described using a very common expression syntax across programming languages, not so difficult to use but still very powerful.  

[Variables](../instructions#variables) can be used in most parts of conditions.  
Expression syntax is not restricted to conditions but can also be evaluated anywhere, simply by wrapping the expression with `{% ... %}`, as follows :  
```yaml
- emit:
    event: someEvent
    payload:
      is20GreaterThan18: "{% 20 > 18 %}" # Will evaluate to true
      currentTimestamp: "{% date({{run.date}}) %}" # Will evaluate to current timestamp
```

## Basic operators

**... greather than ...** :  
`{{someAge}} > 18`   

**... greather than or equals to ...** :  
`{{someAge}} >= 18`  

**... lower than ...** :  
`{{someAge}} < 18`  

**... lower than or equals to ...** :  
`{{someAge}} <= 18`  

**... equals ...** :  
`{{someAge}} == 18`  
`{{someAge}} = 18`  
`{{cityName}} = "Toulouse"`  

**... not equals ...** :  
`{{someAge}} !== 18`  
`{{someAge}} != 18`  

**... matches ...** :  
`"hello" matches "hel"`  

This also works with array of values, in which case it returns true if at least one element matches :  
`"hello" matches {{someArray}}`

**Is this variable defined ?** :  
`{{testedVariable}}`  

**Is this variable empty ?** :  
`!{{testedVariable}}`  

**... in ...** :  
`{{someValue}} in {{someList}}`  
`{{someKey}} in {{someObject}}`  
`{{someKey}} not in {{someObject}}`
`{{someKey}} not in "my,string,list"`
`{{someKey}} not in {{myStringList}}`

**Testing variables types** :  
`isArray(someVariable)`  
`isObject(someVariable)`  


## Logical operators  

Multiple conditions can be chained with **AND** or **OR** :    

**... and ...** :  
`{{someAge}} >= 18 and {{cityName}} == "Toulouse"`    
`{{someAge}} >= 18 && {{cityName}} == "Toulouse"`  

**... or ...** :  
`{{someAge}} >= 18 or {{cityName}} == "Toulouse"`  
`{{someAge}} >= 18 || {{cityName}} == "Toulouse"`  

Conditions can also be groupped and prioritized using **parenthesis** :  
`{{someCity}} == "Paris" || ({{someAge}} >= 18 && {{cityName}} == "Toulouse")`

Conditions can be **reverted** :  
`{{someCity}} == "Paris" || ! ({{someAge}} >= 18 && {{cityName}} == "Toulouse")`
`{{someCity}} == "Paris" || not ({{someAge}} >= 18 && {{cityName}} == "Toulouse")`

## Regular expressions  
When using the `match` operator, a **RegExp** can also be provided with the `regexp()` keyword :  
`
"luke.skywalker@gmail.com" matches regex(luke)
`

## Dates
### Parsing
As long as they are ISO8601 dates, dates can be tested directly within conditions :  

`date("2022-04-13T08:00:05.493Z").hour == 8`   
`date({{mydate}}).minute > 34 && date({{mydate}}).minute < 37`  
`date({{mydate}}).second >= 5`  
`date({{mydate}}).date == 23`  
`date({{mydate}}).month >= 6 && date({{mydate}}).month < 10`  
`date({{mydate}}).year == 2022`  
`date({{mydate}}).day == 3`  
`date({{mydate}}).day in {{allowedDays}}`     
`date({{mydate}}).ts == 1649836805493`  
`date({{mydate}}).iso == '2022-04-13T08:00:05.493Z'`  

* Tested values are **UTC** based  
* **day** starts on **0** for **Sunday** (so **3** is **Wednesday**)

### Formatting
Using this same `date` keyword, we can also generate localized & human readable date strings from some valid ISO8601 date :  

`date("2023-03-31T17:07:23.975Z", "l") == "3/31/2023"`

`date("2023-03-31T17:07:23.975Z", "DD/MM/YYYY") == "3/31/2023"`

`date("2023-03-31T17:07:23.975Z", "LT") == "7:07 PM"`

`date("2023-03-31T17:07:23.975Z", "LT", "fr") == "19:07"`

`date("2023-03-31T17:07:23.975Z", "LT", "fr") == "19:07"`

`date("2023-03-31T17:07:23.975Z", "lll", "fr") == "31 mars 2023 19:07"`

`date("2023-03-31T17:07:23.975Z", "l LT") == "3/31/2023 7:07 PM`

`date("2023-03-31T17:07:23.975Z", "LT", "fr", "America/New_York") == "13:07"`

See all formatting options on https://day.js.org/docs/en/display/format.  
Default language is English, but can be changed with the 3rd parameter ([see available languages](https://github.com/iamkun/dayjs/tree/dev/src/locale)).   
Default time zone is 'Europe/Paris' (explaining the +2 hours shift above), but can be changed with the 4th parameter.

## Math

### Operators
The following math operators are supported : +, -, *, /, % and parenthesis.  

Examples:  
`1+1`  
`1+{{someVariable}}`  
`{{firstVar}} * {{secondVar}}`  
`({{firstVar}} * {{secondVar}} + 10) / 2`   

### Functions

**rand** lets you generate a random number greater than or equal to a minimum value and  less than a maximum value :  
`rand(50, 150)`  
`rand()` without any parameter returns a random floating-point number between 0 and 1.  

**round** lets you round a number to a specified precision (defaults to 0) :  
`round(10.2) == 10`  
`round(10.2,1) == 10.2`  
`round(10.26,1) == 10.3`  

Functions like rand() can also be combined with mathematical operators : `rand(10, 11) * {{var}} + 2`


## String

### JSON parsing or stringify
`json('{"foo": "bar"}') == {"foo": "bar"}`  
`json({"foo": "bar"}) == '{"foo": "bar"}'`  

## String splitting / joining
`split('one,two,thre', ',') == ['one', 'two', 'three']`  
`join(['one', 'two', 'three'], ',') == 'one,two,thre'`  

## String replacement
`replace('hello world', 'world', 'there') == 'hello there'`

## Querystring
`URLSearchParams("key1=value1&key2=value2").asJSON`
`URLSearchParams({foo: "bar", abc: "xyz").asString == "foo=bar&abc=xyz"`
