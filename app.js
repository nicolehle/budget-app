
var budgetController = (function() {
    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
      if(totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      }
      else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function() {
      return this.percentage;
    }

    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type) {
      var sum = 0;

      data.allItems[type].forEach(function(cur) {
        sum += cur.value;
      })

      data.totals[type] = sum;
    }

    var data = {
      allItems: {
        inc: [],
        exp: [],
      },
      totals: {
        inc: 0,
        exp: 0
      },
      budget: 0,
      percentage: -1
    };

    return {
      addItem: function(type, des, val) {
        var newItem, ID;

        //[1 2 3 4], next ID = 6
        //[1 4 6 8], next ID last one + 1


        // Create new ID
        if(data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1
        } else {
          ID = 0;
        }


        // Create new item based on 'inc' or 'exp' type
        if(type === 'exp') {
          newItem = new Expense(ID, des, val);
        } else if(type === 'inc') {
          newItem = new Income(ID, des, val);
        }

        // Push it in to newItem array
        data.allItems[type].push(newItem);
        return newItem;
      },


      deleteItem: function(type, id) {
        var ids, index;
        // id = 6
        // data.allItems[type][id];
        // ids = [1 2 4 6 8]
        // index = 3

        ids = data.allItems[type].map(function(current) {
          return current.id;
        })

        index = ids.indexOf(id)

        if( index !== -1){
         data.allItems[type].splice(index, 1);
        }
      },

      calculateBudget: function() {
        // Calculate total income and expenses
        calculateTotal('inc');
        calculateTotal('exp');

        // Calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        // Calculate percentage of income that we spent
        if(data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
        } else {
          data.percentage = -1
        };
      },

      calculatePercentage: function() {
        data.allItems.exp.forEach(function(cur) {
          cur.calculatePercentage(data.totals.inc);
        })
      },

      getPercentage: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
          return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget: function() {
        return {
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          budget: data.budget,
          percentage: data.percentage
        }
      },

      testing: function(){
        console.log(data)
      }
    };
})();








var UIcontroller = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLable: '.budget__income--value',
    expenseLable: '.budget__expenses--value',
    percentageLable: '.budget__expenses--percentage',
    container: '.container',
    expensePercLabel: '.item__percentage'
  }


  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element, clear;

      // Creat HTML string with placeholder text
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      else if(type === 'exp'){
        element = DOMstrings.expenseContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace the placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);


      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);

    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // Trick to make string to array is calling array methods that put values into a new array to Array.prototype, and call the target.
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      })

      // UX Design => make things easier for the user!
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLable).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expenseLable).textContent = obj.totalExp;

      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMstrings.percentageLable).textContent = '---'
      }

    },


    displayPercentage: function(percentages) {
      var field = document.querySelectorAll(DOMstrings.expensePercLabel);
      var nodeListForEach = function(list, callback) {
        for(let i=0; i < list.length; i++){
          callback(list[i], i)
        }
      }

      nodeListForEach(field, function(current, index) {
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }
        else {
          current.textContent = '---';
        }
      });
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();








var controller = (function(budgetctrl, UIctrl) {

  var setUpEventListener = function() {
      var DOM = UIctrl.getDOMstrings();

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      document.addEventListener('keypress', function(event) {
        if(event.keycode == 13 || event.which == 13){
          ctrlAddItem();
        }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  var updateBudget = function() {
    // 5. Caculate budget
    budgetctrl.calculateBudget();

    // 5-1. return budget
    var budget = budgetctrl.getBudget();

    // 6. display budget on the UI
    UIctrl.displayBudget(budget);
  }

  var updatePercentages = function() {
    // 1. calculate percentages
    budgetctrl.calculatePercentage();

    // 2. read percentages from the budget controller
    var percentages = budgetctrl.getPercentage();

    // 3. update the UI with the new percentages
    UIctrl.displayPercentage(percentages);
  }


  var ctrlAddItem = function() {
    var input, newItem;

    // 1. get value from input field
    input = UIctrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
      // 2. Add new items to the data structures
      newItem = budgetctrl.addItem(input.type, input.description, input.value);

      // 3. Add new items to the UI
      UIctrl.addListItem(newItem, input.type);

      // 4. Empty current value in the input fields
      UIctrl.clearFields();

      // 5. Calculate and Update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {

      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structures
      budgetctrl.deleteItem(type, ID);

      // 2. delete the item from the UI
      UIctrl.deleteListItem(itemID);

      // 3. update and show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();
    }
  }


  return {
    init: function() {
      console.log('Application is working!')
      UIctrl.displayBudget({
        totalInc: 0,
        totalExp: 0,
        budget: 0,
        percentage: 0
      })
      setUpEventListener()
    }
  }
})(budgetController, UIcontroller);

controller.init();
