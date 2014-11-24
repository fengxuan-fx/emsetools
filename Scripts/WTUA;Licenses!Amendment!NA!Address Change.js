if (wfTask == "Amendment Intake" && wfStatus == "Received") {
	//May use this later
}	

if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	logDebug("Cap ID for Address Amendment" + capId);
	processAddressAmendmentTest(capId);
	sendAmendmentResultNotice("Approved");

	var addressType2Change;
	if (typeof(AMENDADDRESS) == "object") {
		for (var j in AMENDADDRESS) {
			if (String(AMENDADDRESS[j]["Change this Address"]).substring(0,1).toUpperCase() == "Y") {
				addressType2Change = AMENDADDRESS[j]["Address Type"];
				break;
			}
		}
	}

	//link up the amendment to all the parents
	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y") {
				if (addressType2Change == "Physical Address") {
					var theCapId = aa.cap.getCapID(AMEND[i]["Record ID"]).getOutput();
					if (appMatch("Licenses/*/*/License",theCapId)) {
				        var pCap = aa.cap.getCap(theCapId).getOutput();
				        var pAppTypeResult = pCap.getCapType();
						var pAppTypeString = pAppTypeResult.toString();
						var pAppTypeArray = pAppTypeString.split("/");

						if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
							createRefLP4Lookup4NurseryGrowerDealer(theCapId);
						} else {
							createRefLP4Lookup(theCapId);
						}

						addLicenseToSet(pAppTypeArray[2],theCapId);
					}
				}
			}
		}
	}	
}

if (wfTask == "Amendment Review" && wfStatus == "Denied") {
	sendAmendmentResultNotice(wfStatus);	
}

if (wfTask == "Amendment Review" && matches(wfStatus,"Approved","Denied")) {
	closeTask("Closure","Closed","","");
}	

function processAddressAmendmentTest(capId) {

	var addIDToChange = null;
	var addTypeToChange = null;
	var theNewAdd = null;
	
	if (typeof(AMENDADDRESS) == "object") {
		for (var i in AMENDADDRESS) {
			var theRow = AMENDADDRESS[i];
			if (theRow["Change this Address"].fieldValue.substring(0,1).toUpperCase() == "Y") {
				addIDToChange = parseInt(theRow["Address ID"]);
				logDebug("Address ID to change" + addIDToChange);
				addTypeToChange = theRow["Address Type"];
			}
		}
	}
	
	if (addIDToChange != null && addTypeToChange != null) {

		if (typeof(AMEND) == "object") {  // table of records to process
			var addArray = aa.address.getAddressByCapId(capId).getOutput();
			if (addArray && addArray.length) theNewAdd = addArray[0];

			//copy address to reference contact
			var refContact = getContactObj(capId,"Applicant");
			var refConAddressModel = createRefContactAddressFromAddress(refContact.refSeqNumber,theNewAdd,addTypeToChange);

			for (var i in AMEND) {
				theCapId = aa.cap.getCapID(AMEND[i]["Record ID"]).getOutput();
				logDebug("Cap Custom ID" +theCapId.getCustomID());
				logDebug("Cap ID" +theCapId);
				if (theCapId) {
					var theContact = getContactObjsBySeqNbr(theCapId,AMEND[i]["Entity ID"]);
					//logDebug("Cap Contact" +theContact.getSuccess());
					if (theContact && String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y" && addIDToChange && theNewAdd) {
						for (var j in theContact.addresses) {
							var theAdd = theContact.addresses[j];
							logDebug("Address ID to change For Cap" + theAdd.getAddressID());
							if (theAdd.getAddressID() == addIDToChange) {					
								//Add and remove the address
								
								logDebug("Address updating on: " + theCapId.getCustomID());
								logDebug("Address added:" + associateRefContactAddressToRecordContact(theCapId,parseInt(theContact.seqNumber),refConAddressModel));
								logDebug("Address removed:" + removeRefContactAddressFromRecordContact(theCapId,parseInt(theContact.seqNumber),theAdd));
								//deactivate address on the reference contact
								theAdd.setAuditStatus("I");
								theAdd.setExpirationDate(aa.date.getCurrentDate());
								var cam = theAdd.getContactAddressModel();
								var editResult = aa.address.editContactAddress(cam);
								if (editResult.getSuccess()) {
									logDebug("Reference address deactivated successfully.");
								} else {
									logDebug("Reference address deactivation failed:" + editResult.getErrorMessage());
								}
								if (servProvCode != "SLA") {
									if (appMatch("Licenses/*/*/License",theCapId) || appMatch("Licenses/*/*/Temporary License",theCapId)) {
										createRefLP4Lookup(theCapId);
									}	
								}
								//update the primary address on the record.
								if ( typeof setPrimaryContactAddress == 'function' ) { 								
									var pContact = getContactObjsBySeqNbr(theCapId,AMEND[i]["Entity ID"]);
									setPrimaryContactAddress(pContact);
								}
							}
						}					
					}
				}
			}
			return true;
		} else {
			logDebug("No addresses were updated");
			return false;
		}

	} else {
		logDebug("No addresses were updated");
		return false;
	}		
}