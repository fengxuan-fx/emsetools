//showDebug=false;
//showMessage=true;
var wfTask=aa.env.getValue("WorkflowTask");
logDebug("WTUA>>>>wfTask=" + wfTask);
var wfStatus=aa.env.getValue("WorkflowStatus");
logDebug("WTUA>>>>wfStatus=" + wfStatus);
if (wfTask == "Milk Industry Review" && wfStatus == "Approved" && (appMatch("Licenses/Milk Dealer/*/Renewal"))) {
	var ID= getCapId();
	logDebug("Cap ID:" + ID);
	//setExpirationDateForMlk(ID);
	}