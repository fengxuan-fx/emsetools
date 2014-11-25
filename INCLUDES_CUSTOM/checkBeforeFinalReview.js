
function checkBeforeFinalReview(ID) {
       var count=0;
       logDebug("Inside checkBeforeFinalReview");
       logDebug("Cap ID: " +ID);
       //var recID=aa.cap.getCapID(ID).getOutput();
       b1ExpResult = aa.expiration.getLicensesByCapID(ID);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                  var workflowResult = aa.workflow.getTasks(ID); 

                  if (workflowResult.getSuccess()) 
                  {
                     logDebug("Inside workflow");  
                     wfObj = workflowResult.getOutput(); 
                   
                     for (i in wfObj) 
                     { 
                       var fTask = wfObj[i].getTaskItem();
                       var stepnumber = fTask.getStepNumber(); 
                       var processID = fTask.getProcessID(); 
                       var desc = fTask.getTaskDescription(); 
                       var disp = fTask.getDisposition(); 
                       logDebug("Step Number:" + stepnumber + " " + "Process ID:" + processID + " " + "Description:" + desc + " " + "Status:" + disp); 
                       if (desc == "Application Intake" && disp =="Received")
                        {
				count++;
                        }
			if (desc == "Application Review" && disp =="Completed")
                        {
				count++;
                        }
			if (desc == "Preliminary Security Review" && (disp == "Approved" || disp == "Decrease in Security" || disp == "Increase in Security" || disp == "No Security Required"))
                        {
				count++;
                        }
			if (desc == "Ag Development Review" && disp=="Approved")
                        {
				count++;
                        }
                        aa.print("Count: " + count);
                     }   
                }
           }
      }
      if (count<4)
      {
           return true;
      }
}