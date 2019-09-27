//Budget controller
let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
    };
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function (type, desc, val) {
            let newItem, id;
            //create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            //create new item defines of type
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            }
            else {
                newItem = new Income(id, desc, val)
            }
            //push items into te data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },


        deleteItem: function (type, id) {
            let ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },
        calculateBudget: function () {
            //calculate total and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data)
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            let allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        }
    }

})();


//UI controller
let UIController = (function () {
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container ',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
let  formatNumber = function (num, type) {
        let numSplit, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)//
        }
        dec = numSplit[1];
        return (type === 'exp' ? sign = '-' : sign = '+') + '' + int+ "." + dec;
    };
    let nodelistForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // + or -
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };

        },
        changeType:function(){
            let fields;
            fields = document.querySelectorAll(DOMstrings.inputType + ','+ DOMstrings.inputDescription + ","+DOMstrings.inputValue)
            nodelistForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function () {
            return DOMstrings
        },
        addListItem: function (obj, type) {
            //create HTML string with placeholder text
            let html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            ;

            //replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber (obj.value,type));

            // insert Html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorId) {
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function (obj) {
            let type;
            obj.budget>0?type ='inc':type ='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        displayPercenges: function (percentages) {
            let field = document.querySelectorAll(DOMstrings.expPercLabel);

            nodelistForEach(field, function (current, index) {
                if (percentages > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '----'
                }
            })
        },
        displayMonth: function(){
            let year, month,months,now;
             now = new Date();
             year = now.getFullYear();
             months =['January','February', 'March', 'April','May','June', 'July','August','September','October','November','December'];
             month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        }

    }
})();


//Global Controller
let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.code === 'Enter') {
                ctlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType)
    };

    let updateBudjet = function () {

        //Calculate the budget
        budgetCtrl.calculateBudget();
//return the budget
        let budget = budgetCtrl.getBudget();

        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    let updatePercentage = function () {
        //calculate  percentages
        budgetCtrl.calculatePercentages();

        //read the percentage from the budget controller
        let percentages = budgetCtrl.getPercentages();
        //update the UI with the new percentages
        UICtrl.displayPercenges(percentages);
    };
    let ctlAddItem = function () {
        let input, newItem;
        //Get the field input data
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //Add the item to the UI controller
            UICtrl.addListItem(newItem, input.type);
            // clear fields
            UICtrl.clearFields();
            //calculate and update budjet
            updateBudjet();
            //calculate and update percentge
            updatePercentage();


        }
    };
    let ctrlDeleteItem = function (event) {
        let ItemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //delete item from the ui
            UICtrl.deleteListItem(itemID);
            //update and the new budget
            updateBudjet();
            //calculate and update percentge
            updatePercentage();

        }

    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();