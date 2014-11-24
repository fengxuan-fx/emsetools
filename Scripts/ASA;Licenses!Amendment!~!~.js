if (appMatch("Licenses/Amendment/Milk Statistical Report/Cooperative")) {
	aa.runScriptInNewTransaction("ACA_HAZMATSCRIPT");
	}

//if (!publicUser) {
//	updateAppStatus("Received","");
//	closeTask("Application Intake","Received","Updated via script","");
//	}

if (!publicUser && appMatch("Licenses/Amendment/Security Change/NA")) {
	updateAppStatus("Received","");
	closeTask("Amendment Received","Received","Updated via script","");
	}

var gp = AInfo['Parent Record ID'];
var gpc = null;
gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	
if (!publicUser && !partialCap) {
	addParent(gpc.getCustomID());
	}

// Start Code to Copy and Populate Amendments in Accela Automation	
	
if (!publicUser) {

copyContacts(gpc,capId);
copyApplSpecific(gpc,capId);
CopyASITablesFromParent(gpc,capId);
}