<div align="center">
  <img width="200" height="200"
    src="https://github.com/chethana101/timp-validate/blob/main/logo/timp-Logo.png">
  <h1>Timp Validate</h1>
  <p>JavaScript Form Validator</p>
  <p>timp-validate is a library for html form validation written entirely in JavaScript, with zero native dependencies.</p>
</div>

## Installation

For install this package you can use below npm command.

`npm install timp-validate`

or inline

```js
<script src="timp-validate.min.js"></script>
```

## Example Usage:
### Markup
Validator module needs proper HTML-markup

```html
<form action="" method="POST" id="form" data-validate="true">
    <div class="form-box">
        <label class="label">Username</label>
        <input type="text" placeholder="Username" name="username" required>
    </div>
    <div class="form-box">
        <label class="label">Password</label>
        <input type="password" placeholder="Password" name="password" required>
    </div>
    <input type="submit" value="Submit" name="login">
</form>
```

### Default initialization

```js
// Require module
var Form = require('timp-validate');

// Initialize
Form('#form').validate();
```
If you need to validate your HTML form using default validation only you have to do is add `data-validate="true"` to your HTML form and also you have to add the `required` attribute to the fields that you want to validate. Then Timp Validator validates the required fields and as the error messages, there is a default message types base on the field type.
`Ex:` If your field type is `text` message will be "This field is required".

If you need to validate all form that inside your application, only you have to do is add `data-validate="all"` this attribute to the every form element.

`Note:` For use above mentioned feature you have to specified the validate fields using `required` attribute.

## Options:

There are multiple types of options that provides for the validation.

### fields

```js
var Form = require('timp-validate');

Form("#form").validate({
    rules: {
        fields: {
            element: "username", // Input field names
            message: "Username can not be empty", // Custom message
            set: ".class-name" // Custome message will set to this element
        },
    },
});
```

You can `Fields` option when you need to add custom message or if you need to set error message to the custom element. For this option `element` is required, otherwise module throw the error. Also you can provide multiple input fields to the `fields` option as a javascript array. 

```js
{
    rules: {
        fields: [
            {
                element: "username",
                message: "Username can not be empty",
                set: "#custom-element",
            },
            {
                element: "password",
                message: "Password can not be empty"
            },
        ],
    }
}
```

### equalTo

Using this option you can check equality of multiple fields.

```js
Form("#form").validate({
    rules: {
        equalTo: [
            {
                equalTo: ["password", "re_password"], // Input field names
                message: "Custom message",
                set: "#custom-element"
            },
            {
                element: ["product_name", "slug", "seo_title"], // Input field names
                message: "Password can not be empty"
            },
        ],
    },
});
```

This option also have 3 attributes which are `element`, `message`, `set`. The `element` is requied parameters and also you have to pass at least 2 element names into the `element` parameter. You can pass those elements as a javascript array. `message` and `set` parameters are optional. If you have any custom message and specific element to set the error message you can set those parameters. Not only that but also you can pass multiple object as `fields` option as above sample code.

### length

You can you this option for check value lengths and character lengths using logics.

```js
Form("#form").validate({
    rules: {
        equalTo: [
            {
                element: "username", // Input field name
                size: 10,
                logic: "min", // Parameters [min, max, minLength, maxLength]
                message: "Custom message",
                set: "#custom-element"
            },
            {
                element: "password", // Input field name
                size: 12,
                logic: "maxLength"
            },
        ],
    },
});
```

In this option there are 5 types of parameters you can pass. From those parameters `element`, `size` and `logic` are required. `message` and `set` parameters are optional as usual. For the `size` parameter you need to pass integer value. And also for the `logic` there are 4 types of values which are `min`, `max`, `minLength`, `maxLength`. `min` and `max` check the value size. `Ex:` 1500 > 1450. Also `minLength` and `maxLength` check the charater length. `Ex:` fieldsOne.length > fieldsTwo.length.

### Custom functions

Timp validator also provides custom function feature. Using this option you can validate using your own rules.

```js
Form("#form").validate({
    rules: {
        fields: [
            {
                element: "username",
                message: "Username can not be empty",
                set: "#custom-element",
            },
            {
                element: "password",
                message: "Password can not be empty"
            },
        ],
        customFunctionName: {
            method: function (element) {
                return false;
            },
            element: "username",
            message: "Custom message",
            set: ".class-name"
        },
    },
});
```
