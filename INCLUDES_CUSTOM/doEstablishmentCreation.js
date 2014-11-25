function doEstablishmentCreation(estId,theContactObj,theBizContact) {

	if (!estId) {  // establishment doesn't exist
		if (!appMatch("Licenses/Amendment/Add-Remove Location/*")) {
			estId = createParent("Licenses","Establishment","NA","NA","");
			}
		else {  // amendment
			var licenseId = getParentLicenseCapID(capId); //getParent();
			
			estId = createParent("Licenses","Establishment","NA","NA","");
			
			}
		
		logDebug("Created Establishment Record " + estId.getCustomID());
		copyContactAddressToAddress(theContactObj,"Physical Address","Physical Address",capId,estId );
			
	}
	

	if (estId) {  // establishment exists, we are just updating
		if (!appMatch("Licenses/Amendment/Add-Remove Location/*")) {
			addParent(estId.getCustomID());
		editAppSpecific("Site Type",AInfo["Site Type"],estId );
		editAppSpecific("Operation Type",AInfo["Operation Type"],estId );
		editAppSpecific("Nursery Size",AInfo["Nursery Size"],estId );
		editAppSpecific("Greenhouse Size",AInfo["Greenhouse Size"],estId );
		editAppSpecific("Acreage",AInfo["Production Acreage"],estId );
		editAppSpecific("Sq. Ft of Glass",AInfo["SqFt of Glass/Plastic"],estId );
		editAppSpecific("Operation Type",AInfo["Dealer Operation Type"],estId );
	}
	}
	else {
		logDebug("WARNING! Establishment not created");
	}

	if (estId && appMatch("Licenses/Plant/Nursery Grower/*")) {
		copyContactAddressToAddress(theContactObj,"Mailing","Plant Inspection Mailing",capId,estId );
		}
		
	return estId;
}	


/* NEW CODE HERE
function doEstablishmentCreation(estId,theContactObj,theBizContact) {
	
	if (!estId) {  // establishment doesn't exist
		if (not amendment)
			estId = createParent("Licenses","Establishment","NA","NA","");
		else {  // amendment
			licenseId = getParent();
			estId = createParent("Licenses","Establishment","NA","NA","",licenseId);
			}
		logDebug("Created Establishment Record " + estId.getCustomID());
		copyContactAddressToAddress(theContactObj,"Physical Address","Physical Address",capId,estId );
		
	
	
	}
	

	if (estId) {  // establishment exists, we are just updating
		if (ot amendment)
			addParent(estId.getCustomID());
		editAppSpecific("Site Type",AInfo["Site Type"],estId );
		editAppSpecific("Operation Type",AInfo["Operation Type"],estId );
		editAppSpecific("Nursery Size",AInfo["Nursery Size"],estId );
		editAppSpecific("Greenhouse Size",AInfo["Greenhouse Size"],estId );
		editAppSpecific("Acreage",AInfo["Production Acreage"],estId );
		editAppSpecific("Sq. Ft of Glass",AInfo["SqFt of Glass/Plastic"],estId );
		editAppSpecific("Operation Type",AInfo["Dealer Operation Type"],estId );
	} else {
		logDebug("WARNING! Establishment not created");
	}

	if (estId && appMatch("Licenses/Plant/Nursery Grower/*")) {
		copyContactAddressToAddress(theContactObj,"Mailing","Plant Inspection Mailing",capId,estId );
		}
		
	return estId;
}	

*/

/* OLD CODE
if (!estId) {
		estId = createParent("Licenses","Establishment","NA","NA","");
		logDebug("Created Establishment Record " + estId.getCustomID());
		copyContactAddressToAddress(theContactObj,"Physical Address","Physical Address",capId,estId );
	}

	if (estId) {
		addParent(estId.getCustomID());
		editAppSpecific("Site Type",AInfo["Site Type"],estId );
		editAppSpecific("Operation Type",AInfo["Operation Type"],estId );
		editAppSpecific("Nursery Size",AInfo["Nursery Size"],estId );
		editAppSpecific("Greenhouse Size",AInfo["Greenhouse Size"],estId );
		editAppSpecific("Acreage",AInfo["Production Acreage"],estId );
		editAppSpecific("Sq. Ft of Glass",AInfo["SqFt of Glass/Plastic"],estId );
		editAppSpecific("Operation Type",AInfo["Dealer Operation Type"],estId );
	} else {
		logDebug("WARNING! Establishment not created");
	}

	if (estId && appMatch("Licenses/Plant/Nursery Grower/*")) {
		copyContactAddressToAddress(theContactObj,"Mailing","Plant Inspection Mailing",capId,estId );
		}
		
	return estId;
}	
*/