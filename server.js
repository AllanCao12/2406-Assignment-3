//Allan Cao
// Student ID 101218998

//const http = require("http");
const fs = require("fs");
//const url = require("url");
//const pug = require("pug");
const express = require("express");

let app = express();
app.use(express.static("public"));
//app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.set("views", "./views");
app.set("view engine", "pug");

/*
app.use(function(req,res,next) {
    console.log("Method: ", req.method, ", URL:" , req.url);
    //console.log("Path: ", req.path);
    console.log("Query Params: ", req.query);
    console.log("Body: ", req.body);
    next();    
});
*/

let vendors = {};
let vendorMaxId = -1;
let vendorMaxSupplyId = {};
//Just a isEmpty helper function
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
//Loading vendors from the .json files
function loadVendors() {
    fs.readdir("./vendors", function (err, files) {
        files.forEach(file => {
            if(!file.endsWith(".json")) return;
            let vendor = require("./vendors/" + file)
            vendors[vendor.id] = vendor;
            vendorMaxId = Math.max(vendorMaxId, vendor.id); //Finding the max id for vendors at the moment
            
            let maxSupplyId = -1;
            for(let cat in vendor.supplies) {
                for(let sid in vendor.supplies[cat]) {
                    maxSupplyId = Math.max(maxSupplyId, sid); //Finding the max id for supplies at the moment
                }
            }
            vendorMaxSupplyId[vendor.id] = maxSupplyId;

            //console.log(`load vendor ${vendor.id} ${vendor.name} from vendors/${file} file`);
        })
    });
}

loadVendors(); //Calling the function

//Rendering the home page
app.get("/", function(req,res,next){
    res.render("pages/index", {})
})

// Rendering the list of vendors
app.get("/vendors", function(req,res,next){
    let array = [];
    for(let id in vendors) {
        array.push(vendors[id]);
    }
    if(req.header('Accept').includes("application/json")) { //if the client requests a json then we send a json
        res.json({vendors: array});
    } else {
        res.render("pages/vendors.pug", {vendors : array}) //if the client request an html then we render the pug file
    }
})

// Rendering the vendor page
app.get("/vendors/:VendorID", function(req,res,next){
    let vendor = vendors[req.params.VendorID];
    if(vendor==null) {
        res.status(404).send("unknown vendor id " + req.params.VendorID);
    } else if(req.header('Accept').includes("application/json")) {
        res.json(vendor);
    } else {
        res.render("pages/vendor.pug", {vendor : vendor})
    }
})
//Rendering the add vendor page
app.get("/addVendor", function(req,res,next){
    res.render("pages/addVendor", {});
})
//Adding a vendor
app.post("/vendors", function(req,res,next){
    
    let newVendor = req.body;
    if(!(newVendor.name && newVendor.delivery_fee > 0 && newVendor.min_order > 0)){
		res.status(400).send("Invalid Input");
		return;
	}

    let found = false;
    for(let id in vendors) {
        if(vendors[id].name == newVendor.name) {
            found = true;
            break;
        }
    }
    if(found) {
        res.status(400).send("existing vendor name");
        return;
    }
    
    newVendor.id = ++vendorMaxId;
    newVendor.supplies = {};
    vendors[newVendor.id] = newVendor;
    vendorMaxSupplyId[newVendor.id] = -1;
    res.json(newVendor); //json rep of new vendor
})

//Changing vendor information
app.put("/vendors/:vendorID", function(req,res,next){
    let vendor = vendors[req.params.vendorID];
    if(vendor == null){
        res.status(404).send("Invalid vendorID")

        return; 
    }
    let changes = req.body;
    for(let key in changes){
        if(key == "name" || key == "min_order" || key == "delivery_fee"){
            vendor[key] = changes[key];
        }else if(key == "supplies"){
            for(let cate in changes.supplies) {
                if(!vendor.supplies.hasOwnProperty(cate)) {
                    vendor.supplies[cate] = {};
                }
                for(let sid in changes.supplies[cate]) {
                    let item = changes.supplies[cate][sid];
                    let supplyId = ++vendorMaxSupplyId[vendor.id];
                    vendor.supplies[cate][supplyId] = item;
                }
            }
        }
    }
    res.status(200).send("ok");
})

app.listen(3000);
console.log("Server listening at http://localhost:3000");