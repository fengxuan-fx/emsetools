
logDebug("Starting function");
var suretyAmt =0;
if (typeof(SECURITYOPTIONS) == "object") {
	for(x in SECURITYOPTIONS) (suretyAmt = suretyAmt + SECURITYOPTIONS[x]["Surety Amount $"]);
	}

logDebug("Surety Amount" + suretyAmt);
var suretyAmtType =0;
if (typeof(SECURITYINSTRUMENTSTYPE) == "object") {
	for(x in SECURITYINSTRUMENTSTYPE) (suretyAmtType = suretyAmtType + SECURITYINSTRUMENTSTYPE[x]["Surety Amount $"]);
	}

logDebug("Surety Amount Type" + suretyAmtType);
if ((suretyAmt != suretyAmtType) && wfTask =="Final Review" && wfStatus == "Approved") {
	showMessage = true;
	cancel = true;
	comment("Surety Amounts do not match.");
	}

logDebug("Ending function");