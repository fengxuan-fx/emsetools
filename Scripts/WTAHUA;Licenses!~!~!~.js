if (wfTask == "Refund - Fiscal Review" && wfStatus == "Refund Approved") {
	addAdHocTask("WFADHOC_PROCESS", "Refund - Issue Refund","");
	}

if (wfTask == "Bad Check Process" && wfStatus == "Completed") {
	addAdHocTask("WFADHOC_PROCESS","Bad Check - Follow Up","") && addAppCondition("Notices","Applied","Bad Check Submitted","Bad Check Submitted","Required");
	}