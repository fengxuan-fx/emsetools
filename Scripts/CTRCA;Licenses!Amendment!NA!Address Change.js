var agencies = new Array();
var licenseTable = new Array();

getContactAmendmentParametersAGM();


if (publicUser) {
	updateAppStatus("Received Online","");
	closeTask("Amendment Intake","Received","","");
	
	var addressType2Change;
	if (typeof(AMENDADDRESS) == "object") {
		for (var j in AMENDADDRESS) {
			if (String(AMENDADDRESS[j]["Change this Address"]).substring(0,1).toUpperCase() == "Y") {
				addressType2Change = AMENDADDRESS[j]["Address Type"];
				break;
			}
		}
	}

	if (addressType2Change != "Physical Address") {
		processAddressAmendment()
		closeTask("Amendment Review","Approved","","");
		closeTask("Closure","Closed","","");
		
		//link up the amendment to all the parents
		if (typeof(AMEND) == "object") {  // table of records to process
			for (var i in AMEND) {
				if (!String(AMEND[i]["Record ID"].fieldValue).equals(String(AInfo['License Number'])))
					if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y") {
						addParent(AMEND[i]["Record ID"]);
						//sync with the reference LP in NYELS and add the license to reprint
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
						}
					}
			}
		}

		sendAmendmentResultNotice("Approved");		
	} else {
		//review is required for physical address
		sendAmendmentReceivedNotice();
	}




	
} else {
	var theContact = getContactObj(capId,"Applicant");
	if (theContact) {

		var addresses = theContact.addresses;
		
		var addrTable = new Array();  

		for (var i in addresses) {
			row = new Array();
			var a = addresses[i];
			var aDesc = "" 
			if (a.getAddressLine1()) aDesc+= a.getAddressLine1();
			if (a.getAddressLine2() && a.getAddressLine2() != "--Select--") aDesc+= " " + a.getAddressLine2();
			if (a.getCity()) aDesc+= " " + a.getCity();
			if (a.getState()) aDesc+= " " + a.getState();
			if (a.getZip()) aDesc+= " " + a.getZip();
			
			row["Address Type"] = new asiTableValObj("Address Type", "" + addresses[i].getAddressType(), "Y");
			row["Address"] = new asiTableValObj("Address", aDesc, "Y");
			row["Address ID"] = new asiTableValObj("Address ID","" + addresses[i].getAddressID(),"Y");
			var changeThisAddress = "No";
			if (addresses.length == 1) changeThisAddress = "Yes";
			row["Change this Address"] = new asiTableValObj("Change this Address", changeThisAddress, "N");
			addrTable.push(row);
			}

		addASITable("AMEND_ADDRESS",addrTable)	

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

		updateAppStatus("Received","");
		closeTask("Amendment Intake","Received","","");
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

	