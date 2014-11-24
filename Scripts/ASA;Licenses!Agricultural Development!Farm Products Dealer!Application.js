if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");

var annPurch = parseInt(AInfo['Expected Annual Purchases This Year $']);
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
	else if(percentBroker == null){
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

if (percentBroker == "0" && percentDollar  != "100"){
	grandTotal = totalB * annPurch;
	
}
if (percentBroker != "0" && percentDollar != "100"){
	grandTotal = totalB * annPurch;
	
}
}

addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "N");


var amount = (feeAmount("AGDV_FPD_S_A")*(1/2));
removeFee("AGDV_FPD_S_A","FINAL");
addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");
//addFee("AGDV_FPD_S_A", "AGDV_FPD", "FINAL", parseInt(AInfo['Sales $'])/2, "Y");
//if(AInfo['What % of your annual dollar volume of purchases from NY producers are you responsible to pay?'] == 0){
//removeFee("AGDV_FPD_SEC","FINAL");
//}
removeFee("AGDV_FPD_S_A","FINAL");