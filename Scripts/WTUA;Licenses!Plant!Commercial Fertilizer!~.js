//showDebug=true;
//showMessage=true;
logDebug("Starting test");
if (wfTask =="Final Review" && wfStatus == "Approved" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}

if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Application") && wfTask =="Final Review" && wfStatus == "Approved"  && checkBeforeFinalReview(getCapId())) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}

if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal") && wfTask =="Final Review" && wfStatus == "Approved"  && checkBeforeFinalReview(getCapId())) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}