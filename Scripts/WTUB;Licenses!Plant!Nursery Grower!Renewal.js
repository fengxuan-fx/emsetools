if (wfTask == "Inspection" && wfStatus == "Complete" && !hasInspectionPerformed()) {
	showMessage = true;
	cancel = true;
	comment("You dont have any inspection has been performed within the last 2 years.");
	}