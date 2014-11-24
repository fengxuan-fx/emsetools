var licenseTable = new Array();
getContactAmendmentParametersAGM();
var allChangeTypes = ["DBA?","SSN?","FEIN?","Email?","Home Phone?","Business Phone?","Mobile Phone?","Fax?","SSN?"]; // array of all possible change types
var reviewRequireChanges = ["FEIN?","SSN?","DBA?"]; //array of change types that require a review
var cChangeType;
var reviewRequired = false;
var changesProcessed = false;

var updateReference = true;

if (publicUser) {

	updateAppStatus("Received Online","");
	closeTask("Amendment Intake","Received","","");

	processChangeRequests();

	//link up the amendment to all the parents
	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			if (!String(AMEND[i]["Record ID"].fieldValue).equals(String(AInfo['License Number'])))
				if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y")
					addParent(AMEND[i]["Record ID"]);
		}
	}
	
} else {
	var theContact = getContactObj(capId,"Applicant");
	if (theContact) {

		for (var i in noFeeRecordTypesToAmend) {
			var relatedContactObjs = theContact.getRelatedContactObjs(noFeeRecordTypesToAmend[i]);
			if (relatedContactObjs) {
				for (var j in relatedContactObjs) {
					var cCapId = relatedContactObjs[j].capId;
					var cCap = aa.cap.getCap(cCapId).getOutput();
					var cCapStatus = cCap.getCapStatus();
					if (exists(cCapStatus,includedStatusList)) {
						addRow(relatedContactObjs[j],0);
						logDebug("Amendment table: added " + relatedContactObjs[j]);					
					}
				}
			}
		}

		addASITable("AMEND",licenseTable);

		loadASITables();

		closeTask("Amendment Intake","Received","","");

		processChangeRequests();

			//link up the amendment to all the parents
		if (typeof(AMEND) == "object") {  // table of records to process
			for (var i in AMEND) {
				if (!String(AMEND[i]["Record ID"].fieldValue).equals(String(AInfo['License Number'])))
					if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y")
						addParent(AMEND[i]["Record ID"]);
			}
		}
	}
}


function addRow(c,theFee) {
	var row = new Array();
	var thisCapId = c.capId;
	var thisCap = aa.cap.getCap(thisCapId).getOutput();
	if (thisCap.isCompleteCap() && thisCap.getAccessByACA != "N") {
		row["Entity ID"] = new asiTableValObj("Entity ID", "" + c.seqNumber, "Y");
		row["Record ID"] = new asiTableValObj("Record ID", "" + thisCapId.getCustomID(), "Y");
		row["Record Description"] = new asiTableValObj("Record Description", "" + thisCap.getCapModel().getAppTypeAlias(), "Y");
		row["Change this Record?"] = new asiTableValObj("Change this Record?", "Y", "N");
		row["Fee"] = new asiTableValObj("Fee", "" + theFee, "Y");
		licenseTable.push(row);
		}
	}

function processChangeRequests() {
	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			theCapId = aa.cap.getCapID(AMEND[i]["Record ID"]).getOutput();
			if (theCapId) {
				//get the affected record app type
				var pCap = aa.cap.getCap(theCapId).getOutput();
	        	var pAppTypeResult = pCap.getCapType();
				var pAppTypeString = pAppTypeResult.toString();
				var pAppTypeArray = pAppTypeString.split("/");
				//get the contact
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
								reviewRequired = true;
							} else {
								if (pAppTypeArray[2] == "Ammonium Nitrate Fertilizer" && matches(allChangeTypes[jj],"Home Phone?","Business Phone?","Mobile Phone?","Fax?")) {
									//handle the scenario when ammonium nitrate change is requested for a phone number
									reviewRequired = true;
								} else {
									//do the change
									var changeMade = true;	
									switch (allChangeTypes[jj]) {
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

								}

								if (changeMade) contactUpdated = true;;
								changesProcessed = true;
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

							addLicenseToSet(pAppTypeArray[2],theCapId);

							if (updateReference) {
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
	} else {
		logDebug("No records found for amendments");
	}

	if (changesProcessed) {
		if (reviewRequired) {
			//send email that some request have been sent, others are pending review
			sendAmendmentReceivedNotice();
		} else {
			//send email that request has been completed
			closeTask("Amendment Review","Approved","","");
			closeTask("Closure","Closed","","");
			sendAmendmentResultNotice("Approved")
		}
	} else {
		if (reviewRequired) {
			//send email that request have been received and review is pending
			sendAmendmentReceivedNotice();
		}
	}	
}

	