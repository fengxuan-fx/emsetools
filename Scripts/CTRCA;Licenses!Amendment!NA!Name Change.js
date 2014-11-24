var agencies = new Array();
var licenseTable = new Array();
getContactAmendmentParametersAGM();

if (publicUser) {

	updateAppStatus("Received Online","");
	closeTask("Amendment Intake","Received","","");	

	//link up the amendment to all the parents
	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			if (!String(AMEND[i]["Record ID"].fieldValue).equals(String(AInfo['License Number'])))
				if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y")
					addParent(AMEND[i]["Record ID"]);
		}
	}
	
	}
else {
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
	}


}

sendAmendmentReceivedNotice();

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

	