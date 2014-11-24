
if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal")){

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
		addFee("AGDV_FPD_S_A","AGDV_FPD", "FINAL", grandTotal, "Y");


		var amount = (feeAmount("AGDV_FPD_S_A"));
		removeFee("AGDV_FPD_S_A","FINAL");
		addFee("AGDV_FPD_SEC", "AGDV_FPD", "FINAL", amount, "Y");
		}
		}


aa.runScriptInNewTransaction("ApplicationSubmitAfter4Renew2");

aa.cap.updateAccessByACA(capId,"Y");

if (!publicUser && !partialCap) {
	updateAppStatus("Received","");
	closeTask("Application Intake","Received","Updated via script","");
	}

if (publicUser) {
	var bConObj = getContactObj(capId,"Business");

	if (bConObj) {
		if (!bConObj.hasPublicUser()) {
			bConObj.linkToPublicUser(publicUserID);
		}
	}
} else {
	var appConObj = getContactObj(capId,"Business");
	if (!appConObj.hasPublicUser()){
		appConObj.sendCreateAndLinkNotification();
		}
}
