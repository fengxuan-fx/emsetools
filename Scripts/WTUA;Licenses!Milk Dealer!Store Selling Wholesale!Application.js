//showDebug=true;
//showMessage=true;
logDebug("Starting test");
var wfTask = aa.env.getValue("WorkflowTask");
logDebug("WTUA>>>>>wfTask=" + wfTask);
var wfStatus = aa.env.getValue("WorkflowStatus");
logDebug("WTUA>>>>>wfStatus=" + wfStatus);
logDebug("Task Status", isTaskActive("Security Review"));
logDebug("App Match Results" + appMatch("Licenses/Milk Dealer/Store Selling Wholesale/Application"));
if ((wfStatus) == "Security Required") {
	addStdCondition("Notices", "Security Instrument");
	}

logDebug("Works");
var capId = getCapId();
logDebug("Test CapId" + capId);
var contactObjArray = getContactObjs(capId);
for(j in contactObjArray){
logDebug("Contact Obj Values" + contactObjArray[j]);

}

ca = getContactArray();
if (ca) {
	for (x in ca) if (ca[x] ["contactType"] == "Business") {
	logDebug("Business Test Successful");
	var fname = ca[x] ["firstName"];
	logDebug("First Name" + fname);
	var lname = ca[x] ["lastName"];
	logDebug("Last Name" + lname);
	var orgName = ca[x] ["businessName"];
	logDebug("Business Name" + orgName);
	var fullName = fname + " " + lname;
	if(orgName == null){
	addLookup("List of Distrubutors", fullName, " ");
	}
	else{
	addLookup("List of Distrubutors", orgName, " ");
	}
	
}
}
