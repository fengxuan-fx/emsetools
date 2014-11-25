function renewLicense(itemCap) {
parentCapId = getParentCapID4Renewal(itemCap);
logDebug("Parent Cap ID" + parentCapId);
if (parentCapId && appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal")) {
	var capID= getCapId();
	logDebug("Cap ID::" + capID);
	var asitArr=new Array();
	asitArr[0]="LIST OF BRANCHES/PLANTS/AGENTS";
	asitArr[1]="LIST OF LOCATIONS OR AGENTS";
	asitArr[2]="LIST OF COMMODITIES";
	asitArr[3]= "RESPONSIBLE FOR PAYMENT LIST";
	asitArr[4]= "PROMPT PAYMENT PROVISION LIST";
	asitArr[5]="SURETY REVISIONS";
	asitArr[6]="SURETY EVENTS";
	logDebug("Copying asi tables");
	copyASITables(capID,parentCapId,asitArr);
	}

if (parentCapId) {
	licExpObj = new licenseObject(parentCapId.getCustomID(),parentCapId);
	}

if (parentCapId) {
	completeRenewal(parentCapId);
	activeLicense(parentCapId);
	renewLicenseSetExp(parentCapId);
	//branch("EMSE:LicProfLookup");
	updateAppStatus("Active","",parentCapId);
	copyAppSpecific(parentCapId);
	closeTask("Closure","Closed","Updated via script","");
	
	updateAppStatus("Issued","Updated via Script", itemCap);
	
	//deleteCopyAddresses (capId, parentCapId);
	copyContacts(itemCap, parentCapId);
	// Copy address and contact back to license;
	copyApplSpecific(itemCap, parentCapId);
	CopyDeleteASIT (itemCap, parentCapId);
	// Copy ASI and ASIT back to license;
	if (matches(appTypeArray[2],"Nursery Grower","Nursery Dealer")) {
		createRefLP4Lookup4NurseryGrowerDealer(parentCapId);
	} else {
		createRefLP4Lookup(parentCapId);
	}
	}

aa.cap.updateAccessByACA(itemCap,"N");
sendEmailLicsIssuedNotice(parentCapId);
// Send email notification;

}
