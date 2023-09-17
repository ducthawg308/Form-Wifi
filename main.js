function Validator (options){
    function getParent (element,selector){
        while (element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};

    function validate(inputElement,rule){
        var errorMessage;
        var errorElement = getParent(inputElement,options.formGroup).querySelector(options.errorSelector);
        var rules = selectorRules[rule.selector]

        for (var i = 0;i<rules.length;i++){
            errorMessage = rules[i](inputElement.value);
            if (errorMessage){
                break;
            }
        }

        if (errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroup).classList.add('invalid');
        }else{
           
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if (formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            
            if (isFormValid){
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce((value,input)=>{
                        value[input.name] = input.value
                        return value;
                    },{});
                    options.onSubmit(formValues);
                }

            }
        }

        options.rules.forEach((rule)=>{
            
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement  = formElement.querySelector(rule.selector);
            if(inputElement){
                inputElement.onblur = function(){     
                    validate(inputElement,rule);
                }
            }

            inputElement.oninput = function(){
                var errorElement = getParent(inputElement,options.formGroup).querySelector(options.errorSelector);
                errorElement.innerText = ''
                getParent(inputElement,options.formGroup).classList.remove('invalid');
            }
        });
    }
}

Validator.isRequired = function(selector,message){
    return {
        selector:selector,
        test: function(value){
            return value.trim()? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isUserName = function(selector){
    return {
        selector:selector,
        test: function(value){
            var regex = /^[A-Za-z0-9]+$/;
            return regex.test(value)? undefined : 'User name không bao gồm các kí tự đặc biệt'
        }
    }
}

Validator.isIP = function(selector,message){
    return {
        selector:selector,
        test: function(value){
            var regex = /^(?=.*\d)(?=.*\.)[0-9.]+$/;
            return regex.test(value)? undefined : message || 'Không phải là một IP'
        }
    }
}

Validator.isEmail = function(selector){
    return {
        selector:selector,
        test: function(value){
            var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(value)? undefined : 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector,min){
    return {
        selector:selector,
        test: function(value){
            return value.length>=min? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,messagr){
    return {
        selector:selector,
        test: function(value){
            return value === getConfirmValue()? undefined : messagr || 'Giá trị nhập vào không chính xác';
        }
    }
}