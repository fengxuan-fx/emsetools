if (wfTask =="Application Intake" && wfStatus =="Received"){
	if (appMatch("Licenses/Amendment/Add-Remove Location/Dealer")||appMatch("Licenses/Plant/Nursery Dealer/Renewal")) {
	addNewLocationfee();
	}
	createOrUpdateEstablishments();
}

logDebug("Cap Id" + capId);

var licenseNum = AInfo['Parent Record ID'];

var licenseCapId = aa.cap.getCapID(licenseNum).getOutput();
logDebug("License Cap ID" + licenseCapId);

if(wfTask =="Application Intake" && wfStatus =="Received")
{
	if(licenseCapId)
		{
			deleteCopyContacts(capId, licenseCapId);
		}
}


