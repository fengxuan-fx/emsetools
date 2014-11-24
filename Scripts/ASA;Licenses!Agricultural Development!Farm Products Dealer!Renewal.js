//Commented Out for test in ASA:Licenses/*/*/Renewal code 11/25/13
/*


//NEW CODE 11/12/13
if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");

var annPurch = parseInt(AInfo['Last Calendar Year Annual Purchases $']);
//var annDolVal = parseInt(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);
var percentDollar = (AInfo['What % of the total annual dollar volume for farm product purchases is sold at retail?']);
var percentBroker = (AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);


var totalB = (100 - percentDollar) * (1/100);
var totalA = (100 - percentBroker) * (1/100);

var subTotal = annPurch * totalA;
var grandTotal = subTotal * totalB;

var rowCount = 0;
var flag;
if (typeof(TYPEOFOPERATIONS) == "object") {

				for(i in TYPEOFOPERATIONS){
				rowCount++;
				}
				
		}
		
if (typeof(TYPEOFOPERATIONS) == "object") {

				for(i in TYPEOFOPERATIONS){
				var firstRow = TYPEOFOPERATIONS[i];
				var columnA = firstRow["Type of Operation"];
				
				if(columnA.fieldValue == "Broker" && rowCount == 1){
				flag = true;
				break;
				}
				else{
				flag = false;
				}
			
			}
		}
		
if(flag){
//add code for flag == "true"
	if(percentBroker == "0"){
		grandTotal = 0;

}
	else{
		grandTotal = annPurch;
}
}

else{
// add code for flag == "false"
if(percentBroker == "0" && percentDollar == "100"){
		grandTotal = 0;
}

if (percentBroker == "0" && percentDollar != "100"){
	grandTotal = totalB * annPurch;
	
}
if (percentBroker != "0" && percentDollar != "100"){
	grandTotal = totalB * annPurch;
	
}
}
//if (!partialCap){
addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "Y");


var amount = (feeAmount("AGDV_FPD_S_A"));
removeFee("AGDV_FPD_S_A","FINAL");
addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");

*/
//END CODE COMMENT OUT 11/25/13 -RF



//}
//addFee("AGDV_FPD_S_A", "AGDV_FPD", "FINAL", parseInt(AInfo['Sales $'])/2, "Y");
//if(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?'] == 0){
//removeFee("AGDV_FPD_SEC","FINAL");
//}
/*
if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");
var annPurch = parseInt(AInfo['Last Calendar Year Annual Purchases $']);
var annDolVal = parseInt(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);
var percentDollar = (AInfo['What % of the total annual dollar volume for farm product purchases is sold at retail?']);
var percentBroker = (AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);


var totalB = (100 - percentDollar) * (1/100);
var totalA = (100 - percentBroker) * (1/100);

var subTotal = annPurch * totalA;
var grandTotal = subTotal * totalB;

if(AInfo['Sales $'] != 0)addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "Y");

var amount = (feeAmount("AGDV_FPD_S_A"));
removeFee("AGDV_FPD_S_A","FINAL");

if(AInfo['Sales $'] != 0) addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");
if(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?'] == 0){
removeFee("AGDV_FPD_SEC","FINAL");
}
*/
/*
if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");

var annPurch = parseInt(AInfo['Last Calendar Year Annual Purchases $']);
//var annDolVal = parseInt(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);
var percentDollar = (AInfo['What % of the total annual dollar volume for farm product purchases is sold at retail?']);
var percentBroker = (AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?']);


var totalB = (100 - percentDollar) * (1/100);
var totalA = (100 - percentBroker) * (1/100);

var subTotal = annPurch * totalA;
var grandTotal = subTotal * totalB;

var rowCount = 0;
var flag;
var rowCount = 0;
var flag;
if (typeof(TYPEOFOPERATIONS) == "object") {

				for(i in TYPEOFOPERATIONS){
				rowCount++;
				}
				
		}

if (typeof(TYPEOFOPERATIONS) == "object") {

				for(i in TYPEOFOPERATIONS){
				var firstRow = TYPEOFOPERATIONS[i];
				var columnA = firstRow["Type of Operation"];
				//rowCount++;
				if(columnA.fieldValue == "Broker" && rowCount == 1){
				flag = true;
				break;
				}
				else{
				flag = false;
				}
			
			}
		}
		
if(flag){
//add code for flag == "true"
	if(percentBroker == 0){
		grandTotal = 0;

}
if(percentBroker >0){
		grandTotal = annPurch;

}
}

else{
// add code for flag == "false"
if(percentBroker == 0 && percentDollar == 100){
		grandTotal = 0;
}

if (percentBroker == 0 && percentDollar != 100){
	grandTotal = totalB * annPurch;
	
}
}

if (!partialCap){

addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "Y");


var amount = (feeAmount("AGDV_FPD_S_A"));
removeFee("AGDV_FPD_S_A","FINAL");
addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");
//addFee("AGDV_FPD_S_A", "AGDV_FPD", "FINAL", parseInt(AInfo['Sales $'])/2, "Y");
//if(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?'] == 0){
//removeFee("AGDV_FPD_SEC","FINAL");
//}
}
*/