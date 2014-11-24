updateAppStatus("Received Online","");
closeTask("Application Intake","Received","Updated via script","");

if (publicUser) {
	updateAppStatus("Received Online","");
	closeTask("Application Intake","Received","Updated via script","");
	}

if (publicUser && appMatch("Licenses/Amendment/Security Change/NA")) {
	updateAppStatus("Received Online","");
	closeTask("Amendment Received","Received","Updated via script","");
	}