function felonyConviction(){
	var ca = getContactArray();
	logDebug(ca);
	felony = false;
	activeCond = 0;
	if (ca) {
	    
		for (x in ca) {
		logDebug(ca[x]);
		if(ca[x]["FELONY"] != null){
		if (ca[x] ["contactType"] == "Business" && (ca[x]["FELONY"].equals("Yes"))) {felony = true;}
		}
		}
		}

	newArray = getConditions("Contact Conditions","Applied","Felony Conviction","Required",capId);
	if (newArray) {
		for (x in newArray) activeCond++;
		}

	logDebug(activeCond);
	busContact = getContactObj(capId,"Business");
	if (activeCond == 0) {
		if(felony == true) addContactStdCondition(busContact.refSeqNumber,"Contact Conditions","Felony Conviction");
		}
	}