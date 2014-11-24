var wfTask=aa.env.getValue("WorkflowTask");
logDebug("WTUA>>>>wfTask=" + wfTask);
var wfStatus=aa.env.getValue("WorkflowStatus");
logDebug("WTUA>>>>wfStatus=" + wfStatus);

if(wfStatus == "Additional Info Required")
{
	logDebug("Need to add the record to set");
	logDebug("Record Type: " + appTypeArray[2]);
	logDebug("Cap Id: " + getCapId());
	addToSetForAdditionalInfoRequired(appTypeArray[2], getCapId());
}
if (wfTask =="Plant Industry Review" && wfStatus == "Denied"){
	deactivateActiveTasks();
	}

if (wfTask =="Application Review" && wfStatus == "Additional Info Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Application Review" && wfStatus == "In Process") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Application Review" && wfStatus == "Complete") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Inspection" && wfStatus == "License Not Required") {
	updateAppStatus("License Not Required","Updated via Script");
	genLNR();
	}

if (wfTask =="Inspection" && wfStatus == "Wrong Application Type") {
	updateAppStatus("Void","Updated via Script");
	}

if (wfTask =="Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Approved","Updated via Script");
	closeTask("Closure","Closed","Updated via script","");
	}

if (wfTask =="Amendment Review" && wfStatus == "Additional Info Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	genAIRAMLetter();
	}

if (wfTask =="Amendment Review" && wfStatus == "Denied") {
	updateAppStatus("Denied","Updated via Script");
	closeTask("Closure","Closed","Updated via script","");
	}

if (wfTask =="Plant Industry Review" && wfStatus == "Additional Info Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	genAIRPLetter();
	}

if (wfTask =="Plant Industry Review" && wfStatus == "Additional License Required") {
	updateAppStatus("Additional License Required","Updated via Script");
	}

if (wfTask =="Plant Industry Review" && wfStatus == "Denied") {
	updateAppStatus("Denied","Updated via Script");
	}

if (wfTask =="Plant Industry Review" && wfStatus == "Complete") {
		updateAppStatus("In Process","Updated via Script");
		if(appMatch("Licenses/Plant/Soil or Plant Inoculant/Product"))
		{
			var isIssued = setLicsToIssued();
			if(isIssued)
			{
				logDebug("License Issued");
				//generateLicenseNumber();
				issueLicense();
				updateAppStatus("Approved","Updated via Script");
				//createOrUpdateEstablishments();
				//logDebug("Parent Id: " + licenseId);
				/*if(licenseId && capId)
				{
					var result = aa.cap.createAppHierarchy(licenseId, capId);
					logDebug("Heirarchy result: " + result.getSuccess());
				}*/
			}
		}
	}
	
//Add License # for Farm Product Dealer Branches
if (wfTask =="Final Review" && wfStatus == "Approved") {
				
			var isIssued = setLicsToIssued();
			if(isIssued)
			{
				logDebug("License Issued");
				logDebug("Cap ID: " + capId);
				//generateLicenseNumberFarm();
				issueLicense(capId);
				//updateAppStatus("Issued","Updated via Script");
				//createOrUpdateEstablishments();
				//logDebug("Parent Id: " + licenseId);
				/*if(licenseId && capId)
				{
					var result = aa.cap.createAppHierarchy(licenseId, capId);
					logDebug("Heirarchy result: " + result.getSuccess());
				}*/
			}
		}
	

if (wfTask =="Milk Industry Review" && wfStatus == "Additional Info Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	genAIRMLetter();
	}

if (wfTask =="Milk Industry Review" && wfStatus == "Hold Pending Investigation") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Milk Industry Review" && wfStatus == "Hold Waiting on Court Decision") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Milk Industry Review" && wfStatus == "Hold Waiting on Hearing") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Milk Industry Review" && wfStatus == "Denied") {
	updateAppStatus("Denied","Updated via Script");
	closeTask("Closure","Closed","Updated via script","");
	}

if (wfTask =="Milk Industry Review" && wfStatus == "Approved") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Security Review" && wfStatus == "Security Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Security Review" && wfStatus == "Waiting for Security") {
	updateAppStatus("Additional Info Required","Updated via Script");
	}

if (wfTask =="Security Review" && wfStatus == "No Security Required") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Ag Development Review" && wfStatus == "Additional Info Required") {
	updateAppStatus("Additional Info Required","Updated via Script");
	genAIRAGLetter();
	}

if (wfTask =="Ag Development Review" && wfStatus == "Approved") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Final Review" && wfStatus == "Denied") {
	updateAppStatus("Denied","Updated via Script");
	closeTask("Closure","Closed","Updated via script","");
	}

if (wfTask =="Preliminary Security Review" && wfStatus == "Additional Security Required") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Preliminary Security Review" && wfStatus == "No Security Required") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Preliminary Security Review" && wfStatus == "Approved") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Final Review" && wfStatus == "Security Re-Review Required") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask =="Final Review" && wfStatus == "Approved") {
	updateAppStatus("In Process","Updated via Script");
	}

if (wfTask == "Application Intake" && wfStatus == "Completed") {
	prefix = "ASA";
	doScriptActions();
	prefeix = "WTUA";
}
	

if(wfTask == "Bad Check Process" && wfStatus == "Completed")
{
	//logDebug("Cap Id: " + getCapId());
	//logDebug("Bad fee check complete");
	//logDebug("Bad fee check complete");
	addToSecuritySet(appTypeArray[2], getCapId(), "Bad Check Fee", appTypeArray[3]);

}

sendEmailLicsExpired(capId);
