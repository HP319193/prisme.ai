# Conditions

[Condition](../instructions#conditions) instructions allows to execute different instructions depending on contextual informations such as the user age, an input form value, ...  

These conditions are described using a very common syntax across programming languages, not so difficult to use but still very powerful.  

[Variables](../instructions#variables) can be used in most parts of conditions. 

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

**Is this variable defined ?** :  
`{{testedVariable}}`  

**Is this variable empty ?** :  
`!{{testedVariable}}`  

**... in ...** :  
`{{someValue}} in {{someList}}`  
`{{someKey}} in {{someObject}}`  
`{{someKey}} not in {{someObject}}`

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
As long as they are ISO8601 dates, dates can be tested directly within conditions :  

`date("2022-04-13T08:00:05.493Z").hour == 8`   
`date({{mydate}}).minute > 34 && date({{mydate}}).minute < 37`  
`date({{mydate}}).second >= 5`  
`date({{mydate}}).date == 23`  
`date({{mydate}}).month >= 6 && date({{mydate}}).month < 10`  
`date({{mydate}}).year == 2022`  
`date({{mydate}}).day == 3`  
`date({{mydate}}).day in {{allowedDays}}`     

* Tested values are **UTC** based  
* **day** starts on **0** for **Sunday** (so **3** is **Wednesday**)
