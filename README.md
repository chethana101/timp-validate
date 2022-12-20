<div align="center">
  <img width="200" height="200"
    src="https://github.com/chethana101/timp-validate/blob/main/resources/images/timp-Logo.png">
  <h1>Timp Validate (Beta)</h1>
  <p>JavaScript Form Validator</p>
  <p>timp-validate is a library for html form validation written entirely in JavaScript, with zero native dependencies.</p>
</div>

## Installation

To install this package you can use the below npm command.

```sh
npm install timp-validate
```

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
`Ex:` If your field type is `text` the message will be "This field is required".

If you need to validate all forms inside your application, the only you have to do is add `data-validate="all"` this attribute to every form element.

`Note:` To use above mentioned feature you have to specify the validate fields using `required` attribute.

## Options:

There are multiple types of options that provide for the validation.

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

You can `Fields` option when you need to add a custom message or if you need to set an error message to the custom element. For this option `element` is required, otherwise, the module throws the error. Also, you can provide multiple input fields to the `fields` option as a javascript array. 

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

This option also has 3 attributes which are `element`, `message`, `set`. The `element` is a required parameter and also you have to pass at least 2 element names into the `element` parameter. You can pass those elements as a javascript array. `message` and `set` parameters are optional. If you have any custom message and specific element to set the error message you can set those parameters. Not only that but also you can pass multiple objects as `fields` options as in the above sample code.

### length

You can you this option to check value lengths and character lengths using logic.

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

In this option, there are 5 types of parameters you can pass. From those parameters `element`, `size`, and `logic` are required. `message` and `set` parameters are optional as usual. For the `size` parameter you need to pass an integer value. And also for the `logic` there are 4 types of values which are `min`, `max`, `minLength`, `maxLength`. `min` and `max` check the value size. `Ex:` 1500 > 1450. Also `minLength` and `maxLength` check the character length. `Ex:` fieldsOne.length > fieldsTwo.length.

### Custom functions

Timp validator also provides custom function feature. Using this option you can validate using your own rules.

```js
Form("#form").validate({
    rules: {
        fields: [
            {
                element: "username", // Input field name
                message: "Username can not be empty",
                set: "#custom-element",
            },
            {
                element: "password", // Input field name
                message: "Password can not be empty"
            },
        ],
        customFunctionName: {
            method: function (element) { // function
                return true; // return true or false
            },
            element: "username",
            message: "Custom message",
            set: ".class-name"
        },
    },
});
```

Using this option you can write your own code to validate the forms. For that, you can pass 4 parameters which are `method`, `element`, `message`, and `set`. From those parameters ` method` and `element` are required. For the `method` parameter you need to assign a function and inside the function, you can write your code. As a parameter of the function validator passes the element that you set as an element. The important thing is as a return value you should need to pass `true` or `false` otherwise validator can't recognize the value. If you are returning the `true` it means validation success and `false` means validation failed.

### onSubmit Handler

```js
Form("#form").validate({
    rules: {
        fields: [
            {
                element: "username", // Input field name
                message: "Username can not be empty",
                set: "#custom-element",
            },
            {
                element: "password", // Input field name
                message: "Password can not be empty"
            },
        ]
    },
    onSubmit: function (form, event) {
        // do something...
    },
});
```

`onSubmit` handler represents the form submission event. When someone clicks on the form submit button validator validates all the rules and if validated success the validator calls the `onSubmit` function. As a function parameters validator give you the `form` element and form submit an event.

### Customization

```js
new Form().init({
    errorElement: "span", // Element type
    parentClass: ".field-box-main" // Error label set append to this class
});
```

Using this option you can customize your error label behaviors and actions. For the `errorElement` you can pass tag names such as `span`, `label`, `p` etc. If you set the `parentClass` parameter the error label append to that class. `Ex:`

```html
<form action="" method="POST" id="form" data-validate="true">
    <div class="field-box-main"> // Parent element
        <label class="label">Username</label>
        <input type="text" placeholder="Username" name="username" required>
        <span>Error<span/> // Error append here
    </div>
    <div class="field-box-main"> // Parent element
        <label class="label">Password</label>
        <input type="password" placeholder="Password" name="password" required>
        <span>Error<span/> // Error append here
    </div>
    <input type="submit" value="Submit" name="login">
</form>
```

### All Options

Here are the all options Timp Validator is providing,

```js
{
    rules: {
        fields: [
           {
             element: "product_name", // Input field name
             message: "Custom message",
             set: ".new_one" // Custome message will set to this element
           },
           {
             element: "slug", // Input field name
             message: "Custom message"
           }
         ],
         equalTo: {
             element: ["product_name", "slug"], // Input field names as a array
             set: ".new_one",
             message: "Custom message"
         },
        length: {
            element: "product_name",
            size: 16,
            logic: "min", // Parameters [min, max, minLength, maxLength]
            message: "Custom message"
        },
        customFunctionName: {
            method: function (element) {
                return false;
            },
            element: "slug",
            message: "Custom message",
            set: ".new_one"
        },
    },
    onSubmit: (form, event) => {
         // do something...
    },
}
```

## Licence

ISC
