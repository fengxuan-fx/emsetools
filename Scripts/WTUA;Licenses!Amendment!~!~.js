if (!appMatch("Licenses/Amendment/NA/*")) { //don't call these lines for contact amendments
	var isIssued = setLicsToIssued();
}


// function tests for workflow;
pid = getParent();
if (appMatch("Licenses/Amendment/Edit Product/NA") && wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateProduct();
	aa.cap.updateAccessByACA(capId,"N");
	// update parent product when status is approved;
	}

if (appMatch("Licenses/Amendment/Add Product/NA") && isIssued) {
	addProductToLicsAsChild();
	closeTask("Closure","Closed","Updated via script","");
	aa.cap.updateAccessByACA(capId,"N");
	
	// add product as a child product to parent product;

	var pId = getParent();
	if (pId) {
		if (gId) {
	        var pCap = aa.cap.getCap(pId).getOutput();
	        var pAppTypeResult = pCap.getCapType();
			var pAppTypeString = pAppTypeResult.toString();
			var pAppTypeArray = pAppTypeString.split("/");

			if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
				createRefLP4Lookup4NurseryGrowerDealer(pId);
			} else {
				createRefLP4Lookup(pId);
			}
		}
	} 
	}


if (!appMatch("Licenses/Amendment/NA/*")) { //don't call these lines for contact amendments
	if (wfTask == "Amendment Review" && wfStatus == "Approved") {
		closeTask("Closure","Closed","Updated via script","");
		aa.cap.updateAccessByACA(capId,"N");
		}

	if (wfTask == "Amendment Review" && wfStatus == "Denied") {
		
		aa.cap.updateAccessByACA(capId,"N");
		}	
}


if (wfTask =="Milk Industry Review" && wfStatus == "Approved") {
	updateAppStatus("Approved","Updated via Script");
	closeTask("License Updated","Issued","Updated via script","");
	aa.cap.updateAccessByACA(capId,"N");
	closeTask("Closure","Closed","Updated via script","");
	}

if ((appMatch("Licenses/Amendment/Add-Remove Location/Dealer") || appMatch("Licenses/Amendment/Add-Remove Location/NA")) && wfTask == "Amendment Review" && wfStatus == "Approved") {
		AmendLicenseNurseryRecords();
		aa.cap.updateAccessByACA(capId,"N");
		if(appMatch("Licenses/Amendment/Add-Remove Location/Dealer"))
		{
			checkLocForAmendment(capId,pid,"Dealer");
		}
		else if(appMatch("Licenses/Amendment/Add-Remove Location/NA"))
		{
			logDebug("Test for grower");
			checkLocForAmendment(capId,pid,"Grower");
		}
		
		//sync to the public inquiry
		var pLic = getApplication(AInfo['Parent Record ID']);
		if (pLic) {
	        var pCap = aa.cap.getCap(pLic).getOutput();
	        var pAppTypeResult = pCap.getCapType();
			var pAppTypeString = pAppTypeResult.toString();
			var pAppTypeArray = pAppTypeString.split("/");

			if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
				createRefLP4Lookup4NurseryGrowerDealer(pLic);
			} else {
				createRefLP4Lookup(pLic);
			}
		}
	}

if (appMatch("Licenses/Amendment/Edit Product/NA") && wfTask == "Amendment Review" && wfStatus == "Approved") {
	AmendmentEditProduct();
	var pId = getParent();
	var gId;
	if (pId)
		var gId = getParentByCapId(pId);
	if (gId) {
		if (gId) {
	        var pCap = aa.cap.getCap(gId).getOutput();
	        var pAppTypeResult = pCap.getCapType();
			var pAppTypeString = pAppTypeResult.toString();
			var pAppTypeArray = pAppTypeString.split("/");

			if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
				createRefLP4Lookup4NurseryGrowerDealer(gId);
			} else {
				createRefLP4Lookup(gId);
			}
		}
	} 
	}

if (appMatch("Licenses/Amendment/Remove Product/NA") && wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Inactive","updated via script",pid);
	aa.cap.updateAccessByACA(capId,"N");
	}