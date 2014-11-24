if (wfTask == "Inspection" && wfStatus == "Complete" && !hasInspectionPerformed()) {
	showMessage = true;
	cancel = true;
	comment("You do not have any inspection performed within the last 2 years.");
	}