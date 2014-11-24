getContactAmendmentParametersAGM();
var allChangeTypes = ["DBA?","SSN?","FEIN?","Email?","Home Phone?","Business Phone?","Mobile Phone?","Fax?","SSN?"]; // array of all possible change types
var reviewRequireChanges = ["FEIN?","SSN?","DBA?"]; //array of change types that require a review

var updateReference = true;

if (wfTask == "Amendment Intake" && wfStatus == "Received") {
// is this needed?
	}	


if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	theContact = getContactObj(capId,"Applicant");

	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			theCapId = aa.cap.getCapID(AMEND[i]["Record ID"]).getOutput();
			if (theCapId) {
				var dbaUpdated = false;
				theContact = getContactObjsBySeqNbr(theCapId,AMEND[i]["Entity ID"]);
				var contactUpdated = false;
				if (theContact && String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y") {
					//get the reference contact for updates
					var refContactNum = theContact.refSeqNumber;
					var contactModelResult = aa.people.getPeople(refContactNum);
					var contactModel;
					if (contactModelResult.getSuccess()) {
						var contactModel = contactModelResult.getOutput();
					}
					for (var jj in allChangeTypes) {
						cChangeType = AInfo[allChangeTypes[jj]];
						if (cChangeType == "CHECKED") {
							if (exists(allChangeTypes[jj],reviewRequireChanges)) {
								//do the change
								var changeMade = true;	
								switch (allChangeTypes[jj]) {
									case "DBA?":
										theContact.people.setTradeName(AInfo['DBA']);
										if (contactModel) contactModel.setTradeName(AInfo['DBA']);
										dbaUpdated = true;
										break;
									case "SSN?":
										theContact.people.setMaskedSsn(AInfo['SSN']);
										if (contactModel) contactModel.setMaskedSsn(AInfo['SSN']);
										editAppSpecific("SSN","***-**-" + AInfo['SSN'].substr(7,4));
										//edit SSN to mask it at this point									
										break;
									case "FEIN?":
										theContact.people.setFein(AInfo['FEIN']);								
										if (contactModel) contactModel.setFein(AInfo['FEIN']);
										break;
									case "Email?":
										theContact.people.setEmail(AInfo['Email']);
										if (contactModel) contactModel.setEmail(AInfo['Email']);
										break;
									case "Home Phone?":
										theContact.people.setPhone1(AInfo['Home Phone']);
										theContact.people.setPhone1CountryCode(AInfo['Home Phone Country Code']);
										if (contactModel) {
											contactModel.setPhone1(AInfo['Home Phone']);
											contactModel.setPhone1CountryCode(AInfo['Home Phone Country Code']);
										}
										break;
									case "Business Phone?":
										theContact.people.setPhone3(AInfo['Business Phone']);
										theContact.people.setPhone3CountryCode(AInfo['Business Phone Country Code']);
										if (contactModel) {
											contactModel.setPhone3(AInfo['Business Phone']);
											contactModel.setPhone3CountryCode(AInfo['Business Phone Country Code']);
										}
										break;
									case "Mobile Phone?":
										theContact.people.setPhone2(AInfo['Mobile Phone']);
										theContact.people.setPhone2CountryCode(AInfo['Mobile Phone Country Code']);
										if (contactModel) {
											contactModel.setPhone2(AInfo['Mobile Phone']);
											contactModel.setPhone2CountryCode(AInfo['Mobile Phone Country Code']);
										}
										break;
									case "Fax?":
										theContact.people.setFax(AInfo['Fax']);
										theContact.people.setFaxCountryCode(AInfo['Fax Country Code']);
										if (contactModel) {
											contactModel.setFax(AInfo['Fax']);
											contactModel.setFaxCountryCode(AInfo['Fax Country Code']);
										}
										break;
									default:
										changeMade = false;
										break;			
								}
								if (changeMade) contactUpdated = true;
								changesProcessed = true;
							} else {
								//Change was already made upon submission of the record.
							}
						}
					}
					if (contactUpdated) {
						theContact.save();
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

							if (dbaUpdated) addLicenseToSet(pAppTypeArray[2],theCapId);

							if (updateReference && contactModel) {
								var refUpdateResult = aa.people.editPeople(contactModel);
								if (refUpdateResult.getSuccess()) {
									logDebug("Reference contact " + refContactNum + " updated successfully");
								} else {
									logDebug("Reference contact " + refContactNum + " update failed: " + refUpdateResult.getErrorType() + ":" + refUpdateResult.getErrorMessage());
								}							
							}
						}
					}
				} else {
					logDebug("Contact was not found on: " + theCapId.getCustomID());
				}
			} else {
				logDebug("The record was not found: " + theCapId.getCustomID());
			}
		}

		if (changesProcessed) {
			//Send approval email
			sendAmendmentResultNotice(wfStatus);
		}
	} else {
		logDebug("No records found for amendments");
	}
}

if (wfTask == "Amendment Review" && wfStatus == "Denied") {
	//Send denied email
	sendAmendmentResultNotice(wfStatus);
}

if (wfTask == "Amendment Review" && matches(wfStatus,"Approved","Denied")) {
	closeTask("Closure","Closed","","");
}	
	



