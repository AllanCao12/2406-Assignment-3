let VendorID = 0;
let vendor = {};
let changes = {};

// Initializing function and also passes in the id of the current vendor
function init(id){
    VendorID = id;
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			vendor = JSON.parse(req.responseText);
			//console.log("Init return:"+ this.responseText);
		}
	}
    req.open("GET", `/vendors/${VendorID}`);
	req.setRequestHeader("Accept", "application/json");
	req.send();
}
// isEmpty helper function
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// function that sends the put request to change the vendor's properties. 
function changeVendor(){
	let value = document.getElementById("vendorName").value.trim();
	if(value && value != vendor.name){
		changes.name = value;
	}else{
		delete changes.name;
	}

	value = parseFloat(document.getElementById("deliveryFee").value.trim());
	if(value > 0 && value != vendor.delivery_fee){
		changes.delivery_fee = value;
	}else{
		delete changes.delivery_fee;
	}
	
	value = parseFloat(document.getElementById("minOrder").value.trim());
	if(value > 0 && value != vendor.min_order){
		changes.min_order = value;
	}else{
		delete changes.min_order;
	}
	if(isEmpty(changes)){
		return;
	}

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState!=4){
			return;
		}
		if(this.status==200){
			alert("Vendor Changed");
			location.reload();
		}
	}
	
	//Send a PUT request to the server containing the recipe data
	req.open("PUT", `/vendors/${VendorID}`);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(changes));
}
//function that adds a category to a store (bonus)
function addCategory(){
	let newCat = document.getElementById("newCategory").value.trim();
	if(!newCat){
		alert("You did not enter a category name!");
		return;
	}
	for(let cat in vendor.supplies){
		if(cat == newCat){
			alert("Category already exists");
			return;
		}
	}

	document.getElementById("newCategory").value = "";

	document.getElementById("supplyCategory").innerHTML += `<option value="${newCat}">${newCat}</option>`;
	document.getElementById("supplyCategory").value = newCat;

	document.getElementById("categories").innerHTML += `<a href="#${newCat}">${newCat}</a><br>`;
	document.getElementById("supplyList").innerHTML += `<div id="cat_${newCat}"><b>${newCat}</b><a name="${newCat}"/><br></div>`;

	if(!changes.hasOwnProperty('supplies')) {
		changes.supplies = {};
	}
	changes.supplies[newCat] = {};
	vendor.supplies[newCat] = {};
}
// Function to add an item to the supply list for the given vendor. 
function addSupply(){

	let newID = -1;
	for(let cat in vendor.supplies){
		for(let itemid in vendor.supplies[cat]){
			newID = Math.max(newID,itemid);
		}
	}
	newID++;

	let category = document.getElementById("supplyCategory").value.trim();
	let name = document.getElementById("itemName").value.trim();
	let price = parseFloat(document.getElementById("itemPrice").value.trim());
	let stock = parseInt(document.getElementById("itemStock").value.trim());
	let description = document.getElementById("itemDescription").value.trim();

	if(!(category && name && description && price > 0 && stock > 0)){
		alert("Invalid input!");
		return;
	}

	document.getElementById(`cat_${category}`).innerHTML += `<div id="supply_${newID}">${newID}: ${name} ($${price}, stock=${stock})<br>${description}<br><br></div>`;

	document.getElementById("itemName").value = "";
	document.getElementById("itemPrice").value = "";
	document.getElementById("itemStock").value = "";
	document.getElementById("itemDescription").value = "";

	if(!changes.hasOwnProperty('supplies')) {
		changes.supplies = {};
	}
	if(!changes.supplies.hasOwnProperty(category)){
		changes.supplies[category] = {};
	}
	let item = {name: name, price: price, stock: stock, description: description};
	changes.supplies[category][newID] = item;
	vendor.supplies[category][newID] = item;
}