if(wfTask == "Final Review" && wfStatus == "Approved")
{
	logDebug("Inside Final Review");
	
	var flag;
	var workflowResult = aa.workflow.getTasks(capId);
	var wfObj;
	var wftrue = workflowResult.getSuccess();
	if (wftrue) 
	{
		wfObj = workflowResult.getOutput();
	}
	else 
	{
		logMessage("**ERROR: Failed to get workflow object: " + capId.getErrorMessage());
	}
	
	for (i in wfObj) 
	{
		var fTask = wfObj[i];
		var desc = fTask.getTaskDescription();
		var disp = fTask.getDisposition();
		
		logDebug("Task: " + desc + "Status: " + disp);
		if(desc == "Preliminary Security Review" && disp == "No Security Required") 
		{
			flag = 1;
			break;
		}
	}
	
	if(flag==1)
	{
		addToSecuritySet("Farm Products Dealer", capId, "Exemption of Security", "Renewal");
	}

}