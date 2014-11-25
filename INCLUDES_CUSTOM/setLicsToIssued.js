function setLicsToIssued() {
    var wFlowTask = "License Issuance";
    var wNewflowStatus = "Issued";
	
	if ((isTaskReadyToIssued(wFlowTask))) {
        //Update and close task
        closeTask(wFlowTask, wNewflowStatus, "Closed via script", "");
        return true;
    }
    return false;
	
}