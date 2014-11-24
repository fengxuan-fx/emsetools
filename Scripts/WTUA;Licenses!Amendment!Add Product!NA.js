if (wfTask == "Application Intake" && wfStatus == "Received"){
	if (AInfo['Do any of your products contain plant nutrients?'] == "Yes" && !appHasCondition("License Checklist","Applied","Commercial Fertilizer License Required","Required")) {
	addStdCondition("License Checklist","Commercial Fertilizer License Required");
	}

	if(feeExists("PLNT_SPI")){
	removeFee("PLNT_SPI","FINAL");
	}
	//updateFee("PLNT_SPI","PLNT_SPI","FINAL",0,"N");
	if(!feeExists("PLNT_SPI")){
	calculateLicenseFees();
	}
}

if (wfTask == "Application Review" && wfStatus == "Additional Info Required") {
	genAIRLetter();
	// Generate AIR Letter;
	}

var isIssued = setLicsToIssued();
// function tests for workflow;
if (isIssued && appMatch("Licenses/Amendment/Add Product/NA")) {
	addProductToLicsAsChild();
	// add product as a child product to parent product;
	
	}

if (isIssued) {
 		closeTask("Closure","Closed","Updated Via Script");

	}