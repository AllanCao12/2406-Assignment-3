let newVendor = {};

function addVendor(){
    newVendor.name = document.getElementById("vendorName").value.trim();
	newVendor.delivery_fee = parseFloat(document.getElementById("deliveryFee").value.trim());
	newVendor.min_order = parseFloat(document.getElementById("minOrder").value.trim());

	/*
	if(!(newVendor.name && newVendor.delivery_fee > 0 && newVendor.min_order > 0)){
		alert("Invalid Input")
		return;
	}
	*/

    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState !=4) return;
		
		if(this.status==200){
			let vendor = JSON.parse(this.responseText);
			alert("Vendor added");
			window.location.replace(`/vendors/${vendor.id}`)
		}else{
			alert("Add failed. "+ this.responseText);

		}
	}
	
	//Send a POST request to the server containing the recipe data
	req.open("POST", `/vendors`);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(newVendor));
}

