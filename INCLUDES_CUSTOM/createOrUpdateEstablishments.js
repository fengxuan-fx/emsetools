function createOrUpdateEstablishments() {
	var addArray = false;
	var estArray = false;
	var estId = false;
	var theContactObj = getContactObj(capId,"Business");
	if (!theContactObj) { 
		logDebug("no business contact to use for establishment");
		return false;
		}

	logDebug("using contact for establishment : " + theContactObj);
	
	var estArray = getCapsByContAndAddress(theContactObj,"Physical Address");

	if (estArray) {
		for (var i in estArray) 
			if (appMatch("Licenses/Establishment/NA/NA",estArray[i].getCapID())) 
				estId = estArray[i].getCapID();
		}

	logDebug("existing establishment : " + estId);
	
	var thisEst = doEstablishmentCreation(estId,theContactObj);

	if (thisEst) {  
		addParent(thisEst.getCustomID());
		} 
	
	if (appMatch("Licenses/Plant/Nursery Grower/Application") || appMatch("Licenses/Plant/Nursery Dealer/Application") || appMatch("Licenses/Amendment/Add-Remove Location/*")) {
		var addArray = getContactObjs(capId, ["Additional Location"]);
		}

	if (appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
		var addArray = getContactObjs(capId, ["Facility Location"]);
		}
		
	if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Application")) {
		var addArray = getContactObjs(capId, ["Branch / Plant / Agent"]);
		}	
	
	if (addArray) {
		for (var i in addArray) {
			estId = false;
			theContactObj = addArray[i];
			logDebug("Additional Location Establishment : " + theContactObj);
			
			estArray = getCapsByContAndAddress(theContactObj,"Physical Address");
			for (var j in estArray) {
				if (appMatch("Licenses/Establishment/NA/NA",estArray[j].getCapID())) {
					estId = estArray[j].getCapID();
					logDebug("Existing Branch Establishment : " + estId);
					branchEst = doEstablishmentCreation(estId,theContactObj);
					if (branchEst) {
						var capContacts = aa.people.getCapContactByCapID(branchEst).getOutput();
						for (var yy in capContacts) { aa.people.removeCapContact(branchEst, capContacts[yy].getPeople().getContactSeqNumber()); }
						theContactObj.replace(branchEst,"Business");
						}
					if (thisEst && branchEst) addParent(thisEst.getCustomID(),branchEst);
					}
				}
				
			if (!estId) {  // no branch establishment found
					logDebug("Creating Branch Establishment");
					branchEst = doEstablishmentCreation(estId,theContactObj);
					if (branchEst) {
						var capContacts = aa.people.getCapContactByCapID(branchEst).getOutput();
						for (var yy in capContacts) { aa.people.removeCapContact(branchEst, capContacts[yy].getPeople().getContactSeqNumber()); }
						theContactObj.replace(branchEst,"Business");
						}
					if (thisEst && branchEst) addParent(thisEst.getCustomID(),branchEst);
				}	
			}
		}
	}
	
