showDebug=true;
showMessage=true;
logDebug("Starting test");
if (AInfo['Hold Import Permit']=="No") {
	addStdCondition("Notices","Import Permit Required");
	}