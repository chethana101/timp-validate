/*
 |---------------------------------------------------------------------
 | Validate Main Function
 |---------------------------------------------------------------------
 */
 (function (global, factory) {
  "use strict";
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document
      ? factory(global, true)
      : function (w) {
          if (!w.document) {
            throw new Error("Timp Validate requires a window with a document");
          }
          return factory(w);
        };
    module.exports = Form;
  } else {
    factory(global);
  }
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
  window.Form = function (attr) {
    var data = {};
    data.error = 0;

    // Check attribute type
    if (attr != null) {
      if (typeof attr === "string") {
        if (
          document.body.contains(
            document.querySelector(attr)
          )
        ) {
          data.forms = document
            .querySelector(attr)
            .querySelectorAll("[required]");
        }
      } else {
        if (document.body.contains(attr)) {
          data.forms = attr.querySelectorAll("[required]");
        }
      }
    }

    /*
     *-----------------------------------------
     * Initialize data
     *-----------------------------------------
     */
    data.init = function (option) {
      // If any parent class
      option?.parentClass
        ? localStorage.setItem("parentClass", option.parentClass)
        : localStorage.removeItem("parentClass");
      // If any error element
      option?.errorElement
        ? localStorage.setItem("errorElement", option.errorElement)
        : localStorage.removeItem("errorElement");
      // If any error style class
      option?.elementStyle
        ? localStorage.setItem("elementStyle", option.elementStyle)
        : localStorage.removeItem("elementStyle");
      // If on foucs out validation set
      option?.focusOutValidate
        ? localStorage.setItem("focusOutValidate", option.focusOutValidate)
        : localStorage.removeItem("focusOutValidate");
    };

    /*
     *-----------------------------------------
     * Validation onSubmit
     *-----------------------------------------
     */
    data.validate = function (options = null) {
      try {
        data.options = options;
        let forms = document.querySelectorAll('[data-validate="true"]');
        if (forms) {
          forms.forEach((form) => {
            form.addEventListener("submit", (event) => {
              event.preventDefault();
              // Check all values are true or false
              let isTrue = (arr) => arr.every((v) => v === true);
              if (
                this.onValidate(options) &&
                options?.onSubmit == undefined &&
                data.error == 0
              ) {
                form.submit();
              } else {
                // Execute onSubmit if any
                if (
                  options &&
                  options.onSubmit &&
                  isTrue(data.optionCheck) &&
                  data.error == 0
                ) {
                  options.onSubmit(document.querySelector(attr), event);
                }
              }
            });
          });
        }
      } catch (error) {}
    };

    /*
     *-----------------------------------------
     * Validate start function
     *-----------------------------------------
     */
    data.onValidate = function (option = null, singleElement = null) {
      data.error = 0;
      data.optionCheck = [];
      let elements = null;

      // If any on focus out element
      if (singleElement) {
        elements = [singleElement];
      } else {
        elements = data.forms;
      }
      // Basic validation
      elements.forEach((element) => {
        let setTo = null;
        let messageType = null;

        // Check is there any custom message for field
        if (option && option?.rules?.fields) {
          let fields = option.rules.fields;

          // Get message from object
          messageType = this.getObjectData(fields, element.name, "message");
          // If no custom message
          if (messageType == null) {
            messageType = this.requiredFor(element.type)
              ? "required"
              : element.type;
          }
          // Get message from object
          setTo = this.getObjectData(fields, element.name, "set");
        }

        // Check field value empty or not
        if (element.value == "") {
          data.error++;
          this.setMessage(element, {
            message: messageType,
            set: setTo,
          });
        } else {
          // Verify elements data
          if (this.dataTypeValidate(element) == false) {
            data.error++;
            this.setMessage(element, {
              message: element.type,
              set: setTo,
            });
          } else {
            // If field not empty check special field types such as email, number
            this.setMessage(element, { remove: true });
          }
        }
      });

      // Validate with options
      if (option) {
        // Check equality of two or more fields at once
        let equalTo = option?.rules?.equalTo;
        if (equalTo) {
          data.optionCheck.push(
            this.passData("equalTo", equalTo, {
              rules: option.rules,
            })
          );
        }
        // Check the length of fields
        let length = option?.rules?.length;
        if (length) {
          data.optionCheck.push(
            this.passData("lengthCheck", length, {
              rules: option.rules,
            })
          );
        }
        // Validate option structure and custom methods
        this.verifyMethods(option.rules);

        return data.optionCheck;
      }

      return data.error == 0 ? true : false;
    };

    /*
     *-----------------------------------------
     * Validate on focus out
     *-----------------------------------------
     */
    data.onFocusOut = function () {
      // Check if on focus out validation on
      if (localStorage.getItem("focusOutValidate")) {
        let requiredFields = data.forms;
        requiredFields.forEach((field) => {
          field.addEventListener("focusout", () => {
            this.onValidate(data.options, field);
          });
        });
      }
    };

    /*
     *-----------------------------------------
     * Pass data to necessary function
     *-----------------------------------------
     */
    data.passData = function (methodName, optionType, data) {
      let arrayBoolean = [];
      try {
        // Is an object
        if (Array.isArray(optionType)) {
          let isTrue = (arr) => arr.every((v) => v === true);
          optionType.forEach((option) => {
            // Pass data to relevent function
            arrayBoolean.push(this[methodName](option, data));
          });
          return isTrue(arrayBoolean);
        } else {
          return this[methodName](optionType, data);
        }
      } catch (error) {
        throw error;
      }
    };

    /*
     *-----------------------------------------
     * Validate data types
     *-----------------------------------------
     */
    data.dataTypeValidate = function (element) {
      switch (element.type) {
        case "email":
          return this.emailValidate(element.value);
        case "url":
          return this.urlValidate(element.value);
        case "checkbox":
          return this.checkBoxValidate(element);
        case "radio":
          return this.radioButtonValidate(element);
        case "date":
          return this.dateValidate(element);
      }
    };

    /*
     *-----------------------------------------
     * Check element type for get required message
     * Ex: If type is `text` return true it means
     * System return required default message
     *-----------------------------------------
     */
    data.requiredFor = function (elementType) {
      let types = ["text", "url", "email"];
      let isTrue = false;
      types.forEach((type) => {
        if (elementType == type) {
          isTrue = true;
        }
      });
      return isTrue;
    };

    /*
     *-----------------------------------------
     * Get specific data from option object
     * If user pass with options this function get-
     * -specific value from user sent object
     *-----------------------------------------
     */
    data.getObjectData = function (dataObj, attrName, need) {
      let returnData = null;
      if (Array.isArray(dataObj)) {
        dataObj.forEach((dataValue) => {
          if (dataValue.element == attrName) {
            returnData = dataValue[need];
          }
        });
      } else {
        if (dataObj.element == attrName) {
          returnData = dataObj[need];
        }
      }
      return returnData;
    };

    /*
     *-----------------------------------------
     * Format the string
     * Add the value into curly brackets and remove-
     * -the curly brackets
     *-----------------------------------------
     */
    data.format = function (source, requiredData) {
      let size = 0;
      if (requiredData?.size) {
        size = requiredData.size;
      }
      let data = source.replace(/({).*?(})/, "$1" + size + "$2");
      return data.replace(/[{}]/g, "");
    };

    /*
     *-----------------------------------------
     * Get relavent error message
     *-----------------------------------------
     */
    data.getError = function (type = null, requiredData, element = null) {
      let message = {
        required: "This field is required",
        email: "Please enter a valid email address",
        url: "Invalid url",
        file: "No file selected",
        checkbox: "Checkbox not selected",
        radio: "Radio button not selected",
        number: "Number field is required",
        password: "Password field is required",
        equalTo: "Please enter the same value again",
        fileType: this.format("Invalid file type {0}", requiredData),
        max: this.format(
          "Please enter a value less than or equal to {0}",
          requiredData
        ),
        min: this.format(
          "Please enter a value greater than or equal to {0}",
          requiredData
        ),
        maxLength: this.format(
          "Please enter no more than {0} characters",
          requiredData
        ),
        minLength: this.format(
          "Please enter at least {0} characters",
          requiredData
        ),
      };

      // Check the field type and return with relavent message
      // for (key in message) {
      //     if (type == key) {
      //         return message[key];
      //     }
      // }
      if (message[type]) {
        return message[type];
      }
      // Check is there any required message from the system
      if (requiredData?.message) {
        return requiredData.message;
      }
      // Check if there any custom message
      if (type == null) {
        return message.required;
      } else {
        // Check if custom message or return default message
        if (element.type == type) {
          return message.required;
        } else {
          return type;
        }
      }
    };

    /*
     *-----------------------------------------
     * Set error messages to the DOM content
     *-----------------------------------------
     */
    data.setMessage = function (element, option = null, requiredData = null) {
      var parent;
      // Check if custom element exist or not
      if (
        (option && option.set == undefined) ||
        (option && option.set == null)
      ) {
        parent = element.parentElement;
        // Check if any parent class sent by user
        if (localStorage.getItem("parentClass")) {
          parent = element.closest(localStorage.getItem("parentClass"));
          if (!parent) {
            parent = document.querySelectorAll(
              localStorage.getItem("parentClass")
            )[0];
          }
        }
      } else {
        parent = document.querySelector(option.set);
      }

      // If error text already exits remove and add new one
      if (
        document.querySelectorAll(
          '[data-error-id="' + element.name + "-error" + '"]'
        )[0]
      ) {
        document.getElementById(element.name + "-error").remove();
        element.removeAttribute("data-error-id");
      }

      // Set the error message
      let label = this.getLabel(element);
      label.innerText = this.getError(option.message, requiredData, element);

      // Add label to the field box
      parent.appendChild(label);
      // Remove error message if requested
      if (option && option.remove) {
        if (
          document.querySelectorAll(
            '[data-error-id="' + element.name + "-error" + '"]'
          )[0]
        ) {
          document.getElementById(element.name + "-error").remove();
          element.removeAttribute("data-error-id");
        }
      }
    };
    // let parent = element.parentNode.parentElement;

    /*
     *-----------------------------------------
     * Get error message label with styels
     * TODO:: Develop multiple error messages styles
     *-----------------------------------------
     */
    data.getLabel = function (field) {
      let errorStyles = `
            .form-error { 
                font-size: 14px;
                font-weight: 500;
                color: #FF0000;
            }
        `;

      if (
        document.querySelectorAll('[data-form-error-style="true"]')[0] ==
        undefined
      ) {
        // Create style element
        let style = document.createElement("style");
        style.setAttribute("data-form-error-style", "true");
        style.innerHTML = errorStyles;

        document.querySelector("head").appendChild(style);
      }

      // Set label id to the input
      field.setAttribute("data-error-id", field.name + "-error");

      let label = document.createElement(
        localStorage.getItem("errorElement") ?? "label"
      );
      label.id = field.name + "-error";

      // If any custom styles
      if (localStorage.getItem("elementStyle")) {
        label.classList.add(localStorage.getItem("elementStyle"));
      } else {
        label.classList.add("form-error");
      }

      return label;
    };

    /*
    |--------------------------------------------------------------------------
    | ☢️ API Functions | Validation 
    |--------------------------------------------------------------------------
    |
    | Here is where api method validate before it's execute
    |
    */
    /*
     *-----------------------------------------
     * Verify methods
     *-----------------------------------------
     */
    data.verifyMethods = function (option) {
      return new Promise((resolve, reject) => {
        const methods = ["equalTo", "password", "length", "fields", "onSubmit"];
        if (option) {
          const sendMethods = Object.keys(option);

          // Looping sent methods
          for (let i = 0; i < sendMethods.length; i++) {
            let found = false;
            // Get one method and check with method list
            methods.forEach((method) => {
              if (sendMethods[i] == method) {
                found = true;
              }
            });
            // Check if method found or not
            if (!found) {
              if (option[sendMethods[i]]?.method) {
                // Check if parameters are available
                let fncElement = option[sendMethods[i]]?.element
                  ? document.getElementsByName(
                      option[sendMethods[i]].element
                    )[0]
                  : reject("Element not found");
                let fncSet = option[sendMethods[i]]?.set
                  ? option[sendMethods[i]].set
                  : null;
                let fncMessage = option[sendMethods[i]]?.message
                  ? option[sendMethods[i]].message
                  : "equalTo";

                // Execute the function
                let methodReturn = option[sendMethods[i]].method(
                  document.getElementsByName(option[sendMethods[i]].element)[0]
                ); // return true or false

                // Assign to global optionCheck variable
                data.optionCheck.push(methodReturn);

                // If method returns false
                if (methodReturn == false) {
                  this.setMessage(fncElement, {
                    message: fncMessage,
                    set: fncSet,
                  });
                }
              } else {
                reject(
                  "Invalid parameter (" +
                    sendMethods[i] +
                    ") | 'method' is missing"
                );
              }
            }
          }
          resolve();
        }
      });
    };

    /*
     *-----------------------------------------
     * Add no validate attribute
     *-----------------------------------------
     */
    data.setValidateRule = function () {
      let formValidRules = ['[data-validate="true"]', '[data-validate="all"]'];
      for (let i = 0; i < formValidRules.length; i++) {
        if (document.querySelectorAll(formValidRules)) {
          document.querySelectorAll(formValidRules).forEach((form) => {
            form.setAttribute("novalidate", "novalidate");
          });
        }
      }
    };

    /*
     *-----------------------------------------
     * Validate all forms
     *-----------------------------------------
     */
    data.redirectWhenValid = function () {
      if (
        document.body.contains(
          document.querySelectorAll('[data-validate="all"]')[0]
        )
      ) {
        let forms = document.querySelectorAll('[data-validate="all"]');
        if (forms) {
          forms.forEach((form) => {
            form.addEventListener("submit", (e) => {
              e.preventDefault();

              data.forms = form.querySelectorAll("[required]");
              this.onValidate();

              if (data.error == 0) {
                form.submit();
              }
            });
          });
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Validate functions
    |--------------------------------------------------------------------------
    */

    /*
     *-----------------------------------------
     * Check equality function
     *-----------------------------------------
     */
    data.equalTo = function (option, data) {
      let checkValues = [];
      let setValue = null;
      let message = "equalTo";
      let fields = data.rules;
      let checkEqual = Array.isArray(option.element)
        ? option.element
        : [option.element];

      // Check if any element exists
      if (option.set) {
        setValue = option.set;
      }
      // Check if any custom message exists
      if (option.message) {
        message = option.message;
      }
      // Assign fields values to the array
      checkEqual.forEach((element) => {
        // Check if field empty or not
        if (document.getElementsByName(element)[0].value == "") {
          let message = null;
          // If empty - Check is there any custom message for the field empty
          if (fields != undefined) {
            message = this.getObjectData(fields, element, "message");
          }
          // If custom message not found assign default empty message
          if (message == "") {
            message = "required";
          }
          // Set error message
          this.setMessage(document.getElementsByName(element)[0], {
            message: message,
            set: setValue,
          });
        }
        checkValues.push(document.getElementsByName(element)[0].value);
      });

      if (!checkValues.includes("")) {
        // Check the values are equals
        const allEqual = (arr) => arr.every((v) => v === arr[0]);
        if (allEqual(checkValues) == false) {
          this.setMessage(document.getElementsByName(checkEqual[1])[0], {
            message: message,
            set: setValue,
          });
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    /*
     *-----------------------------------------
     * Length validation
     *-----------------------------------------
     */
    data.lengthCheck = function (option) {
      let message = "length";
      let setValue = null;
      let logicCheck = false;
      let elementObj = null;
      let requiredData = {
        message: null,
        size: null,
      };

      // Check if element has multiple fields
      if (Array.isArray(option.element)) {
        elementObj = option.element;
      } else {
        elementObj = [option.element];
      }

      // Get element one by one and check
      elementObj.forEach((element) => {
        let field = document.getElementsByName(element)[0];
        // Get the logic
        let logic = option?.logic;
        switch (logic) {
          case "max":
            if (this.numberValidate(field.value)) {
              if (parseInt(field.value) > option.size) {
                logicCheck = true;
                message = "max";
              }
            } else {
              logicCheck = true;
              requiredData.message = "Value should be a number";
            }
            break;
          case "min":
            if (this.numberValidate(field.value)) {
              if (parseInt(field.value) < option.size) {
                logicCheck = true;
                message = "min";
              }
            } else {
              logicCheck = true;
              requiredData.message = "Value should be a number";
            }
            break;
          case "maxLength":
            if (parseInt(field.value.length) > option.size) {
              logicCheck = true;
              message = "maxLength";
            }
            break;
          case "minLength":
            if (parseInt(field.value.length) < option.size) {
              logicCheck = true;
              message = "minLength";
            }
            break;
        }
        // Set size to the required data object
        requiredData.size = option.size;
        // Check if there any custom message
        if (option?.message) {
          message = option.message;
        }
        // Check is there any set element
        if (option?.set) {
          setValue = option.set;
        }
        // Set error message
        if (logicCheck) {
          this.setMessage(
            field,
            {
              message: message,
              set: setValue,
            },
            requiredData
          );
        }
      });
      // loginCheck == true | Error found
      // loginCheck == false | Error not found
      return logicCheck ? false : true;
    };

    /*
     *-----------------------------------------
     * Email validation
     *-----------------------------------------
     */
    data.emailValidate = function (email) {
      return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      );
    };

    /*
     *-----------------------------------------
     * URL validation
     *-----------------------------------------
     */
    data.urlValidate = function (url) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator

      return !!pattern.test(url);
    };

    /*
     *-----------------------------------------
     * Checkbox validation
     *-----------------------------------------
     */
    data.checkBoxValidate = function (element) {
      if (!element.checked) {
        return false;
      }
      return true;
    };

    /*
     *-----------------------------------------
     * Radio Button validation
     *-----------------------------------------
     */
    data.radioButtonValidate = function (element) {
      // Check radio button group or not
      if (document.getElementsByName(element.name).length == 1) {
        // If one radio button found
        if (!element.checked) {
          return false;
        }
        return true;
      } else {
        // If radio button group found
        let checkElement = document.getElementsByName(element.name);
        let isCheckedOne = 0;
        for (let i = 0; i < checkElement.length; i++) {
          if (checkElement[i].checked) {
            // If one radio button check
            isCheckedOne++;
          }
        }
        return isCheckedOne == 1 ? true : false;
      }
    };

    /*
     *-----------------------------------------
     * Number validation
     *-----------------------------------------
     */
    data.numberValidate = function (value) {
      return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    };

    /*
     *-----------------------------------------
     * Date validation
     *-----------------------------------------
     */
    data.dateValidate = function (element) {
      return Date.parse(element.value);
    };

    /*
    |---------------------------------------------------------------------
    | Set common attributes
    |---------------------------------------------------------------------
    */
    data.setValidateRule();
    data.redirectWhenValid();
    data.forms ? data.onFocusOut() : null;

    return data;
  };
});
