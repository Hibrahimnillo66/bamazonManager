var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",

	// Your port; if not 3306
	port: 3306,

	// Your username
	user: "root",

	// Your password
	password: "root",
	database: "bamazon"
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("connected as id " + connection.threadId);
});

var displayProducts = function() {
	var query = "SELECT * FROM products";
	connection.query(query, function(err, res){
		if(err) throw err;
		var displayTable = new Table ({
			head: ["item_id","product_name", "department_name", "price" , "stock_quantity"],
			colWidths:[10,25,25,10,41]
		});
		for(var i=0; i < res.length; i++){
			displayTable.push(
				[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
		console.log(displayTable.toString());
		restartFunction();
	});
}



//Functions that hold all the cases that manager might choose

function menuOptions() {
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View products for sale",
                "View inventory with stock lower than five",
                "Add to inventory to current product",
                "Add a new product",
                "EXIT"

            ]
        }
    ]).then(function(answer) {
        switch (answer.action) {
            case "View products for sale":
                displayProducts();
            break;

            case "View inventory with stock lower than five":
                lowerStock();
            break;

            case "Add to inventory to current product":
                addItems();

            break;

            case "Add a new product":
                addProduct();
            break;

            case "EXIT":
                connection.end();
            break;
        }
    })
}

menuOptions();

// Function to return to main menu
function restartFunction() {
    inquirer.prompt([
        {
            name:"action",
            type:"list",
            message: "Do you want to do another operation?",
            choices: [
                "Yes, please.",
                "No, I am fine thank you."
            ]
        }
    ]).then(function(answer) {
        if(answer.action === "Yes, please.") {
            menuOptions();
        } else {
            connection.end();
        }
    })
}

//Function that returns the products with count lower than five
var lowerStock = function() {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, res) {
        if(err) throw err;
		var displayTable = new Table ({
			head: ["item_id","product_name", "department_name", "price" , "stock_quantity"],
			colWidths:[10,25,25,10,41]
        });
        for(var i=0; i < res.length; i++){
            if(res[i].stock_quantity < 5){
                displayTable.push(
                    [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
                );
            } 
        }
        console.log(displayTable.toString());
        restartFunction();
    });
}

//Function that prompts user how many items they would like to add to a specific product

var addItems = function() {
    inquirer.prompt([
        {
            name: "ID",
            type: "input",
            message: "Select ID of product to add more items.",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }
                return false;
            }
        },
        {
            name: "Quantity",
            type: "input",
            message: "How many Items you want to add?",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }
                return false;
            }
        }
    ]).then(function(answers){
        var quantityAdded = answers.Quantity;
        var idRequested = answers.ID;
        //Function that modifies database according to id selected
        itemsAdded(idRequested, quantityAdded);

    });
};


var itemsAdded = function(ID, amtRequested) {
    connection.query('SELECT * FROM products WHERE item_id = ' + ID, function(err, res) {
        if(err){console.log(err)};
        
            console.log("We have added " + amtRequested + " items to product with ID: " + ID);
            connection.query("UPDATE products SET stock_quantity = stock_quantity + " + amtRequested + " WHERE item_id =" + ID);
            displayProducts();
        
    })
}


// Function to add a new product to database

var addProduct = function() {
    inquirer.prompt([
        {
            name:"id",
            type: "input",
            message: "Input ID for new product",
            validate: function (value) {
				if (isNaN(value) === false) {
					return true;
				}

                return false;
                
            }
        },
        {
            name:"product",
            type:"input",
            message: "Input the name of the product",
            
        },
        {
            name:"department",
            type: "input",
            message: "Input the department where it belongs.",
            
        },
        {
            name: "price",
            type: "input",
            message: "Input the price per unit",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }
                return false;
            }
        },
        {
            name: "stock",
            type: "input",
            message: "Input how many units are in stock",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }
                return false;
            }
        }
    ]).then(function(answers) {
        var productId = answers.id;
        var nameProduct = answers.product;
        var productDepartment = answers.department;
        var productPrice = answers.price;
        var itemStock = answers.stock;

        productInput(productId, nameProduct, productDepartment, productPrice, itemStock);
    });
};

var productInput = function(ID, productName, productDept, prodPrice, itmStock ){
    connection.query('INSERT INTO products (item_id,product_name, department_name, price , stock_quantity) VALUES("' + ID + '","' + productName + '","' + productDept + '",' + prodPrice + ',' + itmStock +  ')');
    console.log("New Item added to list of products.");
    displayProducts();
}