if (wfTask == "Application Review" && wfStatus == "Additional Info Required") {
	genAIRLetter();
	// Generate AIR Letter;
	}

if (wfTask == "Application Intake" && wfStatus == "Additional Info Required") {
	//logDebug("Application Intake Additional Info");
	genADIRLetter();
	// Generate AIR Letter;
	}

	

var isIssued = setLicsToIssued();
aa.print("isIssued:" + isIssued);
//logDebug("isIssued" + isIssued);

// function tests for workflow;
if (isIssued) {
	//aa.print("isIssued:" + isIssued);
	//generateLicenseNumber();
	// must run before ASIT is copied to the license;
	}

if (isIssued) {
	issueLicense(capId);
	}
	


if (wfTask == "Fiscal Review" && wfStatus == "Complete") {
	addAdHocTask("WFADHOC_PROCESS", "Refund Process","");
	}

if (isIssued  && appMatch("Licenses/Plant/Agricultural Liming Material/Application")) {
	createLicenseNumforProduct();
	//Generate License Number for Product;
	}

	if (isIssued && appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
		logDebug("Cap_ID" + capId);
		setLicExpDate4AmmoniumNitFertLics(capId);
		
	// Set expiration date to Dec 31;
	}

	if (isIssued && appMatch("Licenses/Plant/Commercial Compost/Application")) {
	var parentID=getParent();
	cCompostExpireDate(parentID);
	}

if (isIssued && appMatch("Licenses/Plant/Commercial Fertilizer/Application")) {
	var pID=getParent();
	cFertilizerExpireDate(pID);
	}

if (isIssued && appMatch("Licenses/Plant/Soil or Plant Inoculant/Application")) {
	var pID=getParent();
	cFertilizerExpireDate(pID);
	}

if (isIssued && appMatch("Licenses/Plant/Soil or Plant Inoculant/Application")) {
	addProductToLicsAsChild();
	// add product as a child product to parent product;
	}
	


/* Comment Out for Now as no security letter needed
	if (wfTask == "Security Review" && wfStatus == "Security Required" && appMatch("Licenses/Milk Dealer/Distributor/Application")) {
	sendSecurityCommunicationLetter();
	//send email to the applicant;
	}

if (wfTask == "Security Review" && wfStatus == "Security Required" && appMatch("Licenses/Milk Dealer/Store Selling Wholesale/Application")) {
	sendSecurityCommunicationLetter();
	//send email to the applicant;
	}
*/