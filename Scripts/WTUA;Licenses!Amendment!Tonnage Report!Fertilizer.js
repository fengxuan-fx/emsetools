if (wfTask == "Application Intake" && wfStatus == "Received"){
var totalAmt = 0;
	if (typeof(TONNAGEDETAILS) == "object") {
		for(x in TONNAGEDETAILS) if(TONNAGEDETAILS[x]["Fee Code"] == "Fee Applies") totalAmt+=parseFloat(TONNAGEDETAILS[x]["Quantity"]);
		}

	if (AInfo['Reporting Period'] == "July 2013 - December 2013") {
		//addFee("PLNT_TON","TONNAGE","FINAL",totalAmt,"Y");
		//editAppSpecific("January - December Total Tons",totalAmt.toString());
	}
}

gp = getParent();
if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Active","Updated via Script",gp);
	}
	
if (matches(wfTask,"Application Intake") && wfStatus == "Received") {
	prefix = "ASA";
	doScriptActions();
	prefix = "WTUA";
}