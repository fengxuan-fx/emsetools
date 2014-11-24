gp = getParent();
if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Active","Updated via Script",gp);
	}