function issueLicense(capId){
//closeTask("License Issuance","Issued","","");
updateAppStatus("Issued","Updated via Script", capId);
newLicId = createLicense("Active",false,capId);
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

/* the following 80 lines could be replaced with this
if (newLicId) {
	addLicenseToSet(appTypeArray[2],newLicId);
}*/

	if (newLicId && appMatch("Licenses/Milk Dealer/Bargaining and Collecting Coop/Application")) {
		var recordType="Bargaining and Collecting Coop";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/Broker/Application")) {
		var recordType="Broker";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/Distributor/Application")) {
		var recordType="Distributor";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/Milk Hauler/Application")) {
		var recordType="Milk Hauler";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/Operating Cooperative/Application")) {
		var recordType="Operating Cooperative";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/Plant Operator/Application")) {
		var recordType="Plant Operator";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Milk Dealer/SmallStore Opertng Distributor/Application")) {
		var recordType="SmallStore Opertng Distributor";
		addLicenseToSet(recordType,newLicId);
	}

	if (newLicId && appMatch("Licenses/Milk Dealer/Store Selling Wholesale/Application")) {
		var recordType="Store Selling Wholesale";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
		copyContactsForAmmonium(srcCapId, newLicId);
	}
	
	if (newLicId && (appMatch("Licenses/Plant/Nursery Dealer/Application") || appMatch("Licenses/Plant/Nursery Dealer/Renewal"))) {
		var recordType="Nursery Dealer";
		var flag=0;
		addLicenseToSet(recordType,newLicId);
		copyContactsForNursery(capId, newLicId);
		/*var capContactResult=aa.people.getCapContactByCapID(parentID);
		if(capContactResult.getSuccess())
		{
			capContactResult=capContactResult.getOutput();
			for(yy in capContactResult)
			{
				var peopleModel= capContactResult[yy].getPeople();
				if(peopleModel.getContactType()=="Additional Location")
				{
					flag=1;
					break;			
				}
			}
			if(flag==1)
			{
				addAdditionalLocationToSet(recordType,newLicId);
			}
		}*/
	}
	
	if (newLicId && appMatch("Licenses/Plant/Nursery Grower/Application")) {
		var recordType="Nursery Grower";
		addLicenseToSet(recordType,newLicId);
		copyContactsForNursery(capId, newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Establishment/NA/NA")) {
		var recordType="Nursery Grower";
		addLicenseToSet(recordType,newLicId);
		copyContactsForNursery(capId, newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Plant/Agricultural Liming Material/Application")) {
		var recordType="Agricultural Liming Material";
		addLicenseToSet(recordType,newLicId);
	}
	
	//RICK COMMENTS
	if (newLicId && appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
		var recordType="Ammonium Nitrate Fertilizer";
		addLicenseToSet(recordType,newLicId);
	} 
	
	if (newLicId && appMatch("Licenses/Plant/Commercial Fertilizer/Application")) {
		var recordType="Commercial Fertilizer";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Plant/Commercial Compost/Application")) {
		var recordType="Commercial Compost";
		addLicenseToSet(recordType,newLicId);
	}
	
	if (newLicId && appMatch("Licenses/Plant/Soil or Plant Inoculant/Application")) {
		var recordType="Soil or Plant Inoculant";
		addLicenseToSet(recordType,newLicId);
	}
	
	if ((newLicId && appMatch("Licenses/Agricultural Development/Farm Products Dealer/Application")) || (newLicId && appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal"))) {
		var recordType="Farm Products Dealer";
		addLicenseToSet(recordType,newLicId);
		editContactForFarmLicense(capId, newLicId);
	}
	
	/*if(appMatch("Licenses/Plant/Soil or Plant Inoculant/Product"))
	{
		addParent(newLicId);
		logDebug("Parent Id: " + getParent());
	}*/
	
	
	
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





