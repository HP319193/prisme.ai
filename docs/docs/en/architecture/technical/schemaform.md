# Schema Form

JSON Schema Form is a standard data structure to create declaratives complex forms. We added some extra parameters to be used in Prisme.ai platform.

## Basic usage

A schema form start from a single field. This field can be of object type and this will be the better way to build a form :

```yaml
type: 'object'
properties:
  firstname:
    type: string
  lastname:
    type: string
```

This simple structure will make a form with thwo fields and the final value will be an object with two properties : `firstname` and `lastname` :

![Simple form](/assets/images/architecture/schemaform1.png)

## Define a field

The root object and all its children are made with the same structure:

* `type`: Determines the type of the value and the rendered input. Can be:
    * `string`: Text value with a text input.
    * `localized:string`: Text value with translations in any languages.
    * `number`: Number value with a number input.
    * `localized:number`: Number value with different value for any language.
    * `boolean`: A switch button for a true/false value.
    * `localized:boolean`: Different boolean values for any languages.
    * `object`: An object. This type may comes other properties (see below).
    * `array`: An array. This type may comes other properties (see below).
* `title`: Field label as a string.
* `descriptions`: Text displayed in the (i) button as a tooltip. You can set a longer text here to help your user.
* `add`: Optional label for add item button when your type is `object` or `array`.
* `remove`: Optional label for remove item button when your type is `object` or `array`.

* `properties`: Comes with the `object` type. Defines each properties the object may have. This object takes any property as the child field name and a new `Schema Form` as value.
* `additionalProperties`: Comes with the `object` type. Let user adding any other property to the object. Value can be:
    * `true`: Any new property added to the object can have any value.
    * a new `Schema Form`: which describe the structure of the new property value.
* `items`: Comes with the `array` type. Defines format for each items value. Value is a new `Schema Form`.
* `enum`: Utility to restrict for a list of values. Takes an array of values. Display a select drop down.
* `enumNames`: Optional list of labels displayed in place of `enum` values. Takes an array of strings in the same order of value it represents.
* `default`: Optional default value.
* `hidden`: Set to true if you want to hide the field.
* `pattern`: A regular expression to validate the value choose by user.
* `oneOf`: Let the user choose between any options and have different child fields. Takes an array of `Schema Form`. Display a select drop down with the title of each child.
* `ui:widget`: You can set a different input with this attribute. Each type comes with some alternative inputs and you can pass a React component if you write your `Schema Form` as javascript.
    * string type:
        * `textarea`: Replaces the text input by a textarea for more space.
        * `date`: Display a date input with a calendar picker. The value will be a stringfyed date.
        * `color`: Display a color picker.
        * `autocomplete`: Dispkay a text input with autocompletion.
        * `upload`: Display a file picker. Set the choose file as data-URI format as field value. You'll probably need to upload your file and replace it with a URI before submitting the form.
    * localized string type:
        * `textarea`
    * any type:
        * A javascript React Component. Only for Blocks developers who want a custom field they made.
* `ui:options`: Some options for field types and widgets:
    * type array:
        * `array`: Can take `row` value to display each item in row instead of column.
    * type object:
        * `grid`: array of array of array
    * oneOf option:
        * `oneOf`:
    * widget textarea:
        * `textarea`: any attribute of TextArea HTML Element.
    * widget upload:
        * `upload`: Object with property:
            * `accept`: string describing file types allowed to be picked by user in file picker. (see [MDN](https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input/file#accept))
    * type string;
        * `autocomplete`: Source of autocomplete values. Can be:
            * "events:emit": Retreive all events emitted by current workspace and all its installed apps
            * "events:listen": Retreive all events listened by current workspace and all its installed apps
    * or any other key/value to be used with your custom widgets.

## Exemple

```yaml
type: object
title: My Cool Form
description: This is an exemple of form
properties:
  firstName:
    type: string
    title: Firstname
  lastName:
    type: string
    title: Lastname
  birthdate:
    type: date
    title: Birthdate
  genre:
    type: string
    title: Genre
    enum:
      - 1
      - 2
      - 3
    enumNames:
      - Man
      - Woman
      - Other
  address:
    type: string
    ui:widget: textarea
  hobbies:
    type: object
    title: Your hobbies
    properties:
      favoriteMusic:
        type: array
        title: Favorite music
        items:
          type: string
          title: Type an artist name
```
