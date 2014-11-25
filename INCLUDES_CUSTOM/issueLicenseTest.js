function issueLicenseTest(capId){
//closeTask("License Issuance","Issued","","");
updateAppStatus("Issued","Updated via Script");
newLicId = createLicenseForNurseryGrower("Active",false);
logDebug("New License Object" + newLicId);
logDebug("Custom ID" + newLicId.getCustomID());
//copyContacts(capId, newLicId);
var srcCapId = capId;

logDebug("Does not copy contacts now");
//copyContacts(srcCapId, newLicId);

// Copy Contacts

        //copyContacts(capId, newId);

        // Copy Addresses
		/*
        capAddressResult = aa.address.getAddressByCapId(capId);
        if (capAddressResult.getSuccess()) {
            Address = capAddressResult.getOutput();
            for (yy in Address) {
                newAddress = Address[yy];
                newAddress.setCapID(newLicId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }
		*/

logDebug("Inside issueLicense");
var b1ExpResult = aa.expiration.getLicensesByCapID(newLicId);
if(b1ExpResult.getSuccess())
{
	logDebug("Setting Exp Status");
	b1ExpResult = b1ExpResult.getOutput();
	//var licNum=newLicId.getCustomID();
	//thisLic = new licenseObject(licNum,newLicId);
	//thisLic.setExpStatus("Active");
	b1ExpResult.setExpStatus("Active");
	aa.expiration.editB1Expiration(b1ExpResult.getB1Expiration());
	logDebug("Exp Status: " + b1ExpResult.getExpStatus());
}



	
	
	if (newLicId && appMatch("Licenses/Plant/Nursery Grower/Application")) {
		var recordType="Nursery Grower";
		addLicenseToSet(recordType,newLicId);
	}
	
	
	
	
if (newLicId) {
	issueLicenseSetExpiration(srcCapId, newLicId);
	//setLicExpirationDate(newLicId);
	
	editContactType("Business","Business",newLicId);
	pidArray = getFirstLevelParents(capId,"Licenses/Establishment/NA/NA");
	for (var i in pidArray) {
		addParent(pidArray[i].getCustomID(),newLicId);
		logDebug("here is a parent" + pidArray[i].getCustomID());
		}
	aid = getApplication(capIDString);
	logDebug(aid.getCustomID());
	for (var i in pidArray) removeParent(pidArray[i].getCustomID(), aid);
	closeTask("Closure","Closed","Updated via script","");
	aa.cap.updateAccessByACA(capId,"N");
	var license=aa.cap.getCap(newLicId).getOutput();
	logDebug("License Type: " + license.getCapType().getAlias());
	sendEmailLicsIssuedNotice(newLicId);
	// Send email notification;
	


	if (matches(appTypeArray[2],"Nursery Grower","Nursery Dealer")) {
		createRefLP4Lookup4NurseryGrowerDealer(newLicId);
	} else {
		createRefLP4Lookup(newLicId);
	}


}
/* RICK COMMENTS
if (appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
	//generateLicenseNumforFacility();
	// generate license number for each facility row;
	} */
	

var appCreatedBy = cap.getCapModel().getCreatedBy();

    if (appCreatedBy)
        editCreatedBy(appCreatedBy,newLicId);

}

function createLicenseForNurseryGrower(initStatus,copyASI) {
	//initStatus - record status to set the license to initially
	//copyASI - copy ASI from Application to License? (true/false)

	var newLic = null;
	var newLicId = null;
	var newLicIdString = null;
	var newLicenseType = appTypeArray[2];
        var copyASI = true;

	//create the license record
	newLicId = createParent(appTypeArray[0], "Plant", "Nursery Grower", "License",null);

	//field repurposed to represent the current term effective date
	editScheduledDate(sysDateMMDDYYYY,newLicId);
	//field repurposed to represent the original effective date
	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);

	newLicIdString = newLicId.getCustomID();
	updateAppStatus(initStatus,"",newLicId);

	//copy all ASI
	if(copyASI) {
		copyAppSpecific(newLicId);
                copyASITables(capId, newLicId);
	}

	return newLicId;	
}



