function createLicense(initStatus,copyASI,itemCap) {
	//initStatus - record status to set the license to initially
	//copyASI - copy ASI from Application to License? (true/false)

	var newLic = null;
	var newLicId = null;
	var newLicIdString = null;
	
	var cCap = aa.cap.getCap(itemCap).getOutput();
	var cAppTypeResult = cCap.getCapType();
	var cAppTypeString = cAppTypeResult.toString();
	var cAppTypeArray = cAppTypeString.split("/");

	var newLicenseType = cAppTypeArray[2];
        var copyASI = true;

	//create the license record
	newLicId = createParent(cAppTypeArray[0], cAppTypeArray[1], cAppTypeArray[2], "License",null, itemCap);

	//field repurposed to represent the current term effective date
	editScheduledDate(sysDateMMDDYYYY,newLicId);
	//field repurposed to represent the original effective date
	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);

	newLicIdString = newLicId.getCustomID();
	updateAppStatus(initStatus,"",newLicId);

	//copy all ASI
	if(copyASI) {
		copyAppSpecific(newLicId);
                copyASITables(itemCap, newLicId);
	}

	return newLicId;	
}