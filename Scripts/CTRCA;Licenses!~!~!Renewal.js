
if (publicUser) {
	aa.runScriptInNewTransaction("ConvertToRealCapAfter4Renew");
	aa.cap.updateAccessByACA(capId,"Y");
	}
	
	logDebug("Inside ctrca");
	logDebug("Cap Id: " + capId);
	var licId = getParentCapID4Renewal(capId);
	logDebug("Parent Id: " + licId);
	var result = setLicStatusToUnderReview(capId,licId);
	logDebug("Result: " + result);
	if(result)
	{
		logDebug("Inside if");
		updateAppStatus("Under Review - SAPA Applies","Updated via Script",licId);
	}
	aa.cap.updateAccessByACA(capId,"Y");
    


if (!publicUser && !partialCap) {
	updateAppStatus("Received","");
	closeTask("Application Intake","Received","Updated via script","");
	}

var blnValidLics = false;
if (AInfo['Are You Currently Licensed As A Commercial Fertilizer Distributor?'] == "Yes") {
	blnValidLics = validateComFertilizerLicenseNum(AInfo['Enter License number here']);
	}

if (blnValidLics) {
	waveLicenseFee();
	// if they have valid Licenses/Plant/Commercial Fertilizer/License wave all the fees;
	}

genRenewAppLetter();

if (publicUser) {
	var bConObj = getContactObj(capId,"Business");

	if (bConObj) {
		if (!bConObj.hasPublicUser()) {
			bConObj.linkToPublicUser(publicUserID);
		}
	}
}
