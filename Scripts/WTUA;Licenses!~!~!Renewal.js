if (wfTask == "Application Review" && wfStatus == "Additional Info Required") {
	genAIRLetter();
	// Generate AIR Letter;
	}

if (wfTask == "Application Intake" && wfStatus == "Additional Info Required") {
	genADIRLetter();
	// Generate AIR Letter;
	}

if (wfTask == "Application Review" && wfStatus == "Complete" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Application Review" && wfStatus == "Completed" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Milk Industry Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Plant Industry Review" && wfStatus == "Complete" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Final Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Amendment Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}	
	
if (isTaskActive("Plant Industry Review") && anyNewProductLabel()) {
	closeTask("Plant Industry Review","Complete","Updated via Script");
	}
var isIssued = setLicsToIssued();
// function tests for workflow;
if (isIssued) {
	//generateLicenseNumber();
	// must run before ASIT is copied to the license;
	}

if (isIssued) {
	renewLicense(capId);
	addNewContacts();
	}

	/*
if (isIssued && appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Renewal")) {
	var pcapId= getParentCapID4Renewal();
	getNextLicenseNumber4Amm(pcapId);
	// generate license number for each facility row;
	}
	*/

if (isIssued && appMatch("Licenses/Plant/Agricultural Liming Material/Renewal")) {
	createLicenseNumforProduct();
	//Generate License Number for Product;
	}

if (isIssued && appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Renewal")) {
	setLicExpDate4AmmoniumNitFertLics(capId, "Y"); //Y indicates that this is a renewal
	// Set expiration date to Dec 31;
	}

	/*if (isIssued  && appMatch("Licenses/Plant/Agricultural Liming Material/Renewal")) {
	var pcapId=  getParent();
	calExpireDate(pcapId,"Renew");
	}*/

if (isIssued && appMatch("Licenses/Plant/Commercial Compost/Renewal")) {
	var pcapId= getParentCapID4Renewal();
	cCompostExpireDate(pcapId);
	}

if (isIssued && appMatch("Licenses/Plant/Commercial Fertilizer/Renewal")) {
	var pcapId= getParentCapID4Renewal();
	cFertilizerExpireDate(pcapId);
	}

if (appMatch("Licenses/Plant/Soil or Plant Inoculant/Renewal") && isIssued) {
	var pcapId=  getParentCapID4Renewal();
	cFertilizerExpireDate(pcapId);
	}

typeof(PRODUCT)!= "object";
if (isIssued && appMatch("Licenses/Plant/Soil or Plant Inoculant/Renewal")) {
	updateLicsfromRenewal();
	//update only the contacts;
	}

if (wfTask == "Security Review" && wfStatus == "Security Required" && appMatch("Licenses/Milk Dealer/Distributor/Renewal")) {
	sendSecurityCommunicationLetter();
	//send email to the applicant;
	}

if (wfTask == "Security Review" && wfStatus == "Security Required" && appMatch("Licenses/Milk Dealer/Store Selling Wholesale/Renewal")) {
	sendSecurityCommunicationLetter();
	//send email to the applicant;
	}