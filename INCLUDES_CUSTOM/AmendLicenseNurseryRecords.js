function AmendLicenseNurseryRecords () {
var gp = AInfo['Parent Record ID'];
	var gpc = null;
	gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	
	logDebug("Parent Cap ID" + gpc.getCustomID());
copyContacts(capId, gpc);

}