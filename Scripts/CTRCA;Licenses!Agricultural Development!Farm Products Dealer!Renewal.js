showDebug=true;
showMessage=true;
//var test = parseInt(AInfo['Sales $']);
//addFee("AGDV_FPD_S_A", "AGDV_FPD", "FINAL", test,"Y");
//var salesAmt = AInfo['Sales $'];
//logDebug("Sales Amount" + salesAmt);
parentCapId = getParentCapID4Renewal();
if (parentCapId) {
	logDebug("Parent ID: " + parentCapId);
	var myTable2=loadASITable("SECURITY INSTRUMENTS TYPE", parentCapId);
	}
	
if(!publicUser){

var totalPur = (AInfo['Are your annual purchases more than $10,000 dollars?']);
	if(totalPur != "Yes") {
	if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");
		
	}
	else {
	if(feeExists("AGDV_FPD_SEC")) removeFee("AGDV_FPD_SEC","FINAL");

		var annPurch = parseInt(AInfo['Last Calendar Year Annual Purchases $']);

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
		addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "N");


		var amount = (feeAmount("AGDV_FPD_S_A"));
		removeFee("AGDV_FPD_S_A","FINAL");
		addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");
		}
		}
	
var suretyAmt =0;
for(i in myTable2) (suretyAmt = suretyAmt + myTable2[i]["Surety Amount $"]);
logDebug("Surety Amount Figure" + suretyAmt);
var quotient = suretyAmt/salesAmt;
logDebug("Quotient" + quotient);
if (quotient > 0.9) {
	waveLicenseFee();
	}

logDebug("Ending Test");
