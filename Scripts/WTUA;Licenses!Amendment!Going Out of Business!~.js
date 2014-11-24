var pid = getParent();
logDebug("Parent License ID" + pid);
if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Out of Business","updated via script",pid) && licEditExpInfo ==("Inactive");
	closeRelatedLicenses();
	//close all related licenses;
	skipApprProcess();
	
	productArray = getChildren("Licenses/*/*/Renewal", pid);
	for(i in productArray){
	logDebug("Array Values" + productArray[i]);
	var status = aa.cap.getCap(productArray[i]).getOutput().getCapStatus();
	logDebug("Status Of Records" + status);
	if(status == "Issued"){
	continue;
	}
	else{
	updateAppStatus("Withdrawn", "", productArray[i]);
	logDebug("Succesfully completed the script");
	}
	}

	//sync to the public inquiry
	if (pid) {
        var pCap = aa.cap.getCap(pid).getOutput();
        var pAppTypeResult = pCap.getCapType();
		var pAppTypeString = pAppTypeResult.toString();
		var pAppTypeArray = pAppTypeString.split("/");

		if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
			createRefLP4Lookup4NurseryGrowerDealer(pid);
		} else {
			createRefLP4Lookup(pid);
		}
	}
}
