function closeTaskRenewalIRSA(appID, flag, secondFlag)
{
				var workflowResult = aa.workflow.getTasks(appID); 
				var wfObj;
				var wftrue = workflowResult.getSuccess();
				if (wftrue) {
				wfObj = workflowResult.getOutput(); 
				}
				else { 
				logMessage("**ERROR: Failed to get workflow object: " + appID.getErrorMessage()); 
				} 
				
				for (i in wfObj) 
				{ 
				var useProcess = true;
				var fTask = wfObj[i]; 
				var desc = fTask.getTaskDescription(); 
				var wfTask = desc;
				var disp = fTask.getDisposition(); 
				var wfStatus = disp;
				
				logDebug("Task Description" + desc);
				logDebug("Task Status" + disp);
				
				
					
					if(desc == "Closure" && flag == "Yes" && secondFlag == "Yes"){
					var wFlowTask = "Closure";
					var wNewflowStatus = "Closed";
	
					
					logDebug("Goes inside Closure task");
					//Update and close task
					//closeTask(wFlowTask, wNewflowStatus, "Closed via script", "");
					var dispositionDate = aa.date.getCurrentDate();
					var stepnumber = fTask.getStepNumber();
					var processID = fTask.getProcessID();

						if (useProcess)
						aa.workflow.handleDisposition(appID,stepnumber,processID,"Closed",dispositionDate, "","Updated via script",systemUserObj ,"Y");
						else
						aa.workflow.handleDisposition(appID,stepnumber,"Closed",dispositionDate, "","Updated via script",systemUserObj ,"Y");
					
					}
					
				else
				{
				continue;
				}
				}
}