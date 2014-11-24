showMessage=false;
logDebug("Starting test");
var wfTask = aa.env.getValue("WorkflowTask");
logDebug("WTUA>>>>>wfTask=" + wfTask);
var wfStatus = aa.env.getValue("WorkflowStatus");
logDebug("WTUA>>>>>wfStatus=" + wfStatus);
logDebug("Task Status", isTaskActive("Security Review"));
logDebug("App Match Results" + appMatch("Licenses/Milk Dealer/SmallStore Opertng Distributor/Renewal"));
if ((wfStatus) == "Security Required") {
	addStdCondition("Notices", "Security Instrument");
	}