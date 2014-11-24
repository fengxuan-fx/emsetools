getContactAmendmentParametersAGM();

var addAKA = true;
var updateReference = true;

if (wfTask == "Amendment Intake" && wfStatus == "Received") {
	//is this needed?
}	


if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	theContact = getContactObj(capId,"Applicant");
	
	if (theContact.people.getContactTypeFlag() == "organization") addAKA = false;

	if (theContact && addAKA) {
		theContact.addAKA(theContact.people.getFirstName(),theContact.people.getMiddleName(),theContact.people.getLastName(),"",new Date(),null);
		logDebug("Name Amendment: added AKA on ref contact " + theContact.refSeqNumber);
		}

	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			theCapId = aa.cap.getCapID(AMEND[i]["Record ID"]).getOutput();
			
			if (theCapId) {
				theContact = getContactObjsBySeqNbrForAGM(theCapId,AMEND[i]["Entity ID"]);
				if (theContact && String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y") {
					
					doNameAmendment(theContact,AInfo["First Name"],AInfo["Middle Name"],AInfo["Last Name"],AInfo["Suffix"],getAppSpecific("Business Name"));
					
					//sync with the reference LP in NYELS and add the license to reprint
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


					logDebug("Name Amendment: changing name on record " + theCapId.getCustomID());
					
				}
			}
		}
	}
	sendAmendmentResultNotice("Approved");
}

if (wfTask == "Amendment Review" && wfStatus == "Denied") {
	//Send denied email
	sendAmendmentResultNotice(wfStatus);
}

if (wfTask == "Amendment Review" && matches(wfStatus,"Approved","Denied")) {
	closeTask("Closure","Closed","","");
}	
	
function doNameAmendment(co,fn,mn,ln,sf,bn) {  // contactObj, name data
	co.people.setFirstName(fn);
	co.people.setMiddleName(mn);
	co.people.setLastName(ln);
	co.people.setNamesuffix(sf);
	co.people.setBusinessName(bn);
	co.saveBase();

	if (updateReference) {	
		//update the reference contact
		var refContactNum = co.refSeqNumber;
		var contactModelResult = aa.people.getPeople(refContactNum);
		if (contactModelResult.getSuccess()) {
			var contactModel = contactModelResult.getOutput();

			contactModel.setFirstName(fn);
			contactModel.setMiddleName(mn);
			contactModel.setLastName(ln);
			contactModel.setNamesuffix(sf);
			contactModel.setBusinessName(bn);
			if (AInfo['Contact Type Flag'] == "individual") {
				contactModel.setContactType("Individual");	
			}
			if (AInfo['Contact Type Flag'] == "organization") {
				contactModel.setContactType("Organization");	
			}		
			var refUpdateResult = aa.people.editPeople(contactModel);
			if (refUpdateResult.getSuccess()) {
				logDebug("Reference contact " + refContactNum + " updated successfully");
			} else {
				logDebug("Reference contact " + refContactNum + " update failed: " + refUpdateResult.getErrorType() + ":" + refUpdateResult.getErrorMessage());
			}
		} else {
			logDebug("Could not retrieve reference contact: " + contactModelResult.getErrorType() + ":" + contactModelResult.getErrorMessage());
		}
	}

}



 function getContactObjsBySeqNbrForAGM(itemCap,seqNbr) {
	/*var result = aa.people.getCapContactByPK(itemCap,seqNbr);
	
    if (result.getSuccess()) {
		var csm = result.getOutput();
		return new contactObj(csm);
	}*/
	var capContactArray = null;

	var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
        var capContactArray = capContactResult.getOutput();
    }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (String(capContactArray[yy].getPeople().contactSeqNumber).equals(String(seqNbr)) && (capContactArray[yy].getPeople().contactType.toUpperCase() == "BUSINESS")) {
                logDebug("getContactObjsBySeqNbr returned the contact on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }
        
}



