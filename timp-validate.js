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
  } else {
    factory(global);
  }
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
  window.Form = function (attr) {
    var data = {};
    data.error = 0;

    if (attr != null) {
      if (typeof attr === "string") {
        data.forms = document
          .querySelector(attr)
          .querySelectorAll("[required]");
      } else {
        data.forms = attr.querySelectorAll("[required]");
      }
    }

    data.init = function (option) {
      option?.parentClass
        ? localStorage.setItem("parentClass", option.parentClass)
        : localStorage.removeItem("parentClass");

      option?.errorElement
        ? localStorage.setItem("errorElement", option.errorElement)
        : localStorage.removeItem("errorElement");
    };

    data.validate = function (options = null) {
      try {
        let forms = document.querySelectorAll('[data-validate="true"]');
        if (forms) {
          forms.forEach((form) => {
            form.addEventListener("submit", (event) => {
              event.preventDefault();

              let isTrue = (arr) => arr.every((v) => v === true);
              if (
                this.onValidate(options) &&
                options?.onSubmit == undefined &&
                data.error == 0
              ) {
                form.submit();
              } else {
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

    data.onValidate = function (option = null) {
      data.error = 0;
      data.optionCheck = [];
      let elements = data.forms;

      elements.forEach((element) => {
        let setTo = null;
        let messageType = null;

        if (option && option?.rules?.fields) {
          let fields = option.rules.fields;

          messageType = this.getObjectData(fields, element.name, "message");

          if (messageType == null) {
            messageType = this.requiredFor(element.type)
              ? "required"
              : element.type;
          }

          setTo = this.getObjectData(fields, element.name, "set");
        }

        if (element.value == "") {
          data.error++;
          this.setMessage(element, {
            message: messageType,
            set: setTo,
          });
        } else {
          if (this.dataTypeValidate(element) == false) {
            data.error++;
            this.setMessage(element, {
              message: element.type,
              set: setTo,
            });
          } else {
            this.setMessage(element, { remove: true });
          }
        }
      });

      if (option) {
        let equalTo = option?.rules?.equalTo;
        if (equalTo) {
          data.optionCheck.push(
            this.passData("equalTo", equalTo, {
              rules: option.rules,
            })
          );
        }

        let length = option?.rules?.length;
        if (length) {
          data.optionCheck.push(
            this.passData("lengthCheck", length, {
              rules: option.rules,
            })
          );
        }

        this.verifyMethods(option.rules);

        return data.optionCheck;
      }

      return data.error == 0 ? true : false;
    };

    data.passData = function (methodName, optionType, data) {
      let arrayBoolean = [];
      try {
        if (Array.isArray(optionType)) {
          let isTrue = (arr) => arr.every((v) => v === true);
          optionType.forEach((option) => {
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
      }
    };

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

    data.format = function (source, requiredData) {
      let size = 0;
      if (requiredData?.size) {
        size = requiredData.size;
      }
      let data = source.replace(/({).*?(})/, "$1" + size + "$2");
      return data.replace(/[{}]/g, "");
    };

    data.getError = function (type = null, requiredData) {
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

      if (message[type]) {
        return message[type];
      }

      if (requiredData?.message) {
        return requiredData.message;
      }

      if (type == null) {
        return message.required;
      } else {
        return type;
      }
    };

    data.setMessage = function (element, option = null, requiredData = null) {
      var parent;

      if (
        (option && option.set == undefined) ||
        (option && option.set == null)
      ) {
        parent = element.parentElement;

        if (localStorage.getItem("parentClass")) {
          parent = element.closest(localStorage.getItem("parentClass"));
        }
      } else {
        parent = document.querySelector(option.set);
      }

      if (
        document.querySelectorAll(
          '[data-error-id="' + element.name + "-error" + '"]'
        )[0]
      ) {
        document.getElementById(element.name + "-error").remove();
        element.removeAttribute("data-error-id");
      }

      let label = this.getLabel(element);
      label.innerText = this.getError(option.message, requiredData);

      parent.appendChild(label);

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

    data.getLabel = function (field) {
      let errorStyles = `
          .form-error { 
              font-size: 14px;
              font-weight: 500;
              color: var(--red);
              display: inline-block;
              margin-top: 5px;
          }
      `;

      if (
        document.querySelectorAll('[data-form-error-style="true"]')[0] ==
        undefined
      ) {
        let style = document.createElement("style");
        style.setAttribute("data-form-error-style", "true");
        style.innerHTML = errorStyles;

        document.querySelector("head").appendChild(style);
      }

      field.setAttribute("data-error-id", field.name + "-error");

      let label = document.createElement(
        localStorage.getItem("errorElement") ?? "label"
      );
      label.id = field.name + "-error";
      label.classList.add("form-error");

      return label;
    };

    data.verifyMethods = function (option) {
      return new Promise((resolve, reject) => {
        const methods = ["equalTo", "password", "length", "fields", "onSubmit"];
        if (option) {
          const sendMethods = Object.keys(option);

          for (let i = 0; i < sendMethods.length; i++) {
            let found = false;

            methods.forEach((method) => {
              if (sendMethods[i] == method) {
                found = true;
              }
            });

            if (!found) {
              if (option[sendMethods[i]]?.method) {
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

                let methodReturn = option[sendMethods[i]].method(
                  document.getElementsByName(option[sendMethods[i]].element)[0]
                );

                data.optionCheck.push(methodReturn);

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

    data.redirectWhenValid = function () {
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
    };

    data.equalTo = function (option, data) {
      let checkValues = [];
      let setValue = null;
      let message = "equalTo";
      let fields = data.rules;
      let checkEqual = Array.isArray(option.element)
        ? option.element
        : [option.element];

      if (option.set) {
        setValue = option.set;
      }

      if (option.message) {
        message = option.message;
      }

      checkEqual.forEach((element) => {
        if (document.getElementsByName(element)[0].value == "") {
          let message = null;

          if (fields != undefined) {
            message = this.getObjectData(fields, element, "message");
          }

          if (message == "") {
            message = "required";
          }

          this.setMessage(document.getElementsByName(element)[0], {
            message: message,
            set: setValue,
          });
        }
        checkValues.push(document.getElementsByName(element)[0].value);
      });

      if (!checkValues.includes("")) {
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

    data.lengthCheck = function (option) {
      let message = "length";
      let setValue = null;
      let logicCheck = false;
      let elementObj = null;
      let requiredData = {
        message: null,
        size: null,
      };

      if (Array.isArray(option.element)) {
        elementObj = option.element;
      } else {
        elementObj = [option.element];
      }

      elementObj.forEach((element) => {
        let field = document.getElementsByName(element)[0];

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

        requiredData.size = option.size;

        if (option?.message) {
          message = option.message;
        }

        if (option?.set) {
          setValue = option.set;
        }

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

      return logicCheck ? false : true;
    };

    data.emailValidate = function (email) {
      return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      );
    };

    data.urlValidate = function (url) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" +
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
          "((\\d{1,3}\\.){3}\\d{1,3}))" +
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
          "(\\?[;&a-z\\d%_.~+=-]*)?" +
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );

      return !!pattern.test(url);
    };

    data.checkBoxValidate = function (element) {
      if (!element.checked) {
        return false;
      }
      return true;
    };

    data.radioButtonValidate = function (element) {
      if (document.getElementsByName(element.name).length == 1) {
        if (!element.checked) {
          return false;
        }
        return true;
      } else {
        let checkElement = document.getElementsByName(element.name);
        let isCheckedOne = 0;
        for (let i = 0; i < checkElement.length; i++) {
          if (checkElement[i].checked) {
            isCheckedOne++;
          }
        }
        return isCheckedOne == 1 ? true : false;
      }
    };

    data.numberValidate = function (value) {
      return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    };

    return data;
  };
});

let formInt = new Form();
formInt.setValidateRule();
formInt.redirectWhenValid();

module.exports = Form;
