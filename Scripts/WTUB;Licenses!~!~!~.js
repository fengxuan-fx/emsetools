logDebug("inside wtub:/licenses/*/* test");
addFelony = 0;

newArray = getConditions("Contact Conditions","Applied","Felony Conviction","Required",capId);
if (newArray) {
	for (x in newArray) addFelony++;
	}
	logDebug("Felony: " + addFelony);

if (addFelony > 0) {
	if(wfTask =="Application Review" && (wfStatus == "Completed" || wfStatus == "Complete")) {
	showMessage = true;
	cancel = true;
	logDebug("Felony condition");
	comment("Felony Conviction Condition must be released");
	}
}

if (addFelony > 0) {
	if(wfTask =="Amendment Review" && wfStatus =="Approved") {
	showMessage = true;
	cancel = true;
	logDebug("Felony condition");
	comment("Felony Conviction Condition must be released");
	}
}



if (wfTask == "Application Intake" && wfStatus == "Completed") {
	if (!checkRequiredASIFields()) {
		cancel = true;
		showMessage = true;
		comment("Required fields have not been completed for application specific information.");
	}
}

/*if(wfStatus == "Additional Info Required")
{
	logDebug("Inside additional");
	var countNum = testCount();
	
	 if(countNum == 0)
	 {
		logDebug("Condition true");
		cancel = true;
		showMessage = true;
		comment("Please select at least one deficiency option.");	
	}
}*/

//Comment Out Conditions for Non License Unit JIRA NYELS-15575 
/*
if (wfTask =="Plant Industry Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
	*/
if (wfTask =="Application Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
/*
	
var assignStaff = fTask.getTaskItem().getAssignedUser();
var currUser = aa.person.getCurrentUser();
var personObj = currUser.getOutput();
var fName = personObj.getFirstName();
var mName = personObj.getMiddleName();
var lName = personObj.getLastName();

if(assignStaff != (fName + mName + lName)) {
showMessage = true;
	cancel = true;
	comment("You cannot update a task for someone else");
	}
	else {
	showMessage = true;
	cancel = true;
	comment("This is the right person");
	}

logDebug("User ID" + fName + mName + lName);
logDebug("Staff" + assignStaff); 
*/

var workflowResult = aa.workflow.getTasks(capId); 
				var wfObj;
				var wftrue = workflowResult.getSuccess();
				if (wftrue) {
				wfObj = workflowResult.getOutput(); 
				}
				else { 
				logMessage("**ERROR: Failed to get workflow object: " + capId.getErrorMessage()); 
				} 
				var inspFirstName;
				var inspLastName;
				
				for (i in wfObj) 
				{ 
				var useProcess = true;
				var fTask = wfObj[i]; 
				var desc = fTask.getTaskDescription(); 
				var disp = fTask.getDisposition(); 
				var flag;
				logDebug("Task Description" + desc);
				logDebug("Task Status" + disp);
				
						var assignStaff = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();
						var userID = wfUserId;
						var capDetailObjResult = aa.cap.getCapDetail(capId);                          
                                                                               
                  if (capDetailObjResult.getSuccess()) {
                  capDetail = capDetailObjResult.getOutput();
				  capDetail.setAsgnStaff(userID);
				  var assignedID = capDetail.getAsgnStaff();
                                                                                               
             if (!matches(assignedID,null,undefined,"")) {
 
                     personObjResult = aa.person.getUser(assignedID);
                        if (personObjResult.getSuccess()) {
                                                                                                                               
                            personObj = personObjResult.getOutput();
								if(personObj.getFirstName() != "") {
								inspFirstName = personObj.getFirstName();
								 logDebug("FirstName final" + inspFirstName);
								//addParameter(params, "$$inspEmail$$", inspEmail);
                                  
                                  } else {
                                   logDebug("**ERROR: Inspector Email is null");
                                   }
							
							if(personObj.getLastName() != "") {
									inspLastName = personObj.getLastName();
									logDebug("Last Name final" + inspLastName);
									//addParameter(params, "$$inspPhone$$", inspPhone);
                                    
                                    } else {
                                    logDebug("**ERROR: Inspector Phone is null");
                                      }
                                 
 
                                  } else {
                                           logDebug("**ERROR: Could not retrieve the personScriptModel: " + personObjResult.getErrorMessage());
                                             sendEmail = false;
                                          }
                                        } else {
                                            logDebug("**ERROR: No staff assigned.");
                                            sendEmail = false;
                                   }				  
				  }
				  else {
                  logDebug("**ERROR: Could not retrieve the capDetailModel: " + capDetailObjResult.getErrorMessage());
                  sendEmail = false;
                       } 
					
				
				
				}
				
			var userFullName = inspFirstName + " " + inspLastName;
			var currUser = aa.person.getCurrentUser();
			var personObj = currUser.getOutput();
			var fName = personObj.getFirstName();
			var mName = personObj.getMiddleName();
			var lName = personObj.getLastName();

			var currUser = fName + " " + lName;
			
			if(userFullName != currUser) {
			showMessage = true;
			cancel = true;
			comment("You cannot update a task for someone else");
			}

var addBusCount = 0;
ca = getContactArray();
if(!appMatch("Licenses/Amendment/NA/*"))
{
if (ca) {
	for (x in ca) if (ca[x] ["contactType"] == "Business") addBusCount++;
	}


if (addBusCount == 0) {
			showMessage = true;
			cancel = true;
			comment("You must have at least 1 business contact");
	}
}
	
function testCount(){
	logDebug("Inside testCount");
	var thisArr = new Array();
	var count = 0;
	useTaskSpecificGroupName = true;
    loadTaskSpecific(thisArr, capId);
	
	for(i in thisArr)
	{
		logDebug("Index: " + i + " " + thisArr[i]);
		
	}
	
	logDebug(wfTask + " " + wfProcess);
	
	if (thisArr[wfProcess + "." + wfTask + ".Application Requires an Original Ink Signature"] == "CHECKED") {
	
		count++;	
    }
	
	if(thisArr[wfProcess + "." + wfTask + ".License Fee is incorrect or not included"]== "CHECKED")
	{
		logDebug("License Fee is incorrect or not included");
		count++;
	}
	
	if (thisArr[wfProcess + "." + wfTask + ".Missing answers to questions"] == "CHECKED") {
	
		count++;

    }
	
	 if (thisArr[wfProcess + "." + wfTask + ".Business Name"] == "CHECKED") {
	
		count++;

    }

  
	 if (thisArr[wfProcess + "." + wfTask + ".Felony or Misdemeanor Information"] == "CHECKED") {
	
		count++;

    }
  
   if (thisArr[wfProcess + "." + wfTask + ".Business Address"] == "CHECKED") {
	
		count++;

    }

   
	 if (thisArr[wfProcess + "." + wfTask + ".Check Not Signed"] == "CHECKED") {
	
		count++;
		
    }
	

	 if (thisArr[wfProcess + "." + wfTask + ".Business Telephone and/or Fax Number"] == "CHECKED") {
	
		count++;
		
    }

	 if (thisArr[wfProcess + "." + wfTask + ".Federal ID/Social Security Number"] == "CHECKED") {
	
		count++;
		
    }

	
	 if (thisArr[wfProcess + "." + wfTask + ".Name of Applicants"] == "CHECKED") {
	
		count++;
	
    }

	 if (thisArr[wfProcess + "." + wfTask + ".Financial Update/Balance Sheet"] == "CHECKED") {
	
		count++;
    }
	
	 if (thisArr[wfProcess + "." + wfTask + ".Names of Corporate Officers"] == "CHECKED") {
	
		count++;
    }


	
	 if (thisArr[wfProcess + "." + wfTask + ".State Incorporated In"] == "CHECKED") {
	
		count++;
    }
	
	
	 if (thisArr[wfProcess + "." + wfTask + ".Home Addresses of Corporate Officers"] == "CHECKED") {
		
		count++;
    }

	 if (thisArr[wfProcess + "." + wfTask + ".Date Incorporated"] == "CHECKED") {
	
		count++;
		
    }

	
	 if (thisArr[wfProcess + "." + wfTask + ".Corporate Officers Stockholder Statement"] == "CHECKED") {
	
		count++;
		
    }
	
	
	 if (thisArr[wfProcess + "." + wfTask + ".Business Year End"] == "CHECKED") {
	
		count++;
		
    }

	 if (thisArr[wfProcess + "." + wfTask + ".Schedule A"] == "CHECKED") {
	
		count++;
		
    }

  
	 if (thisArr[wfProcess + "." + wfTask + ".Surety Bond Missing/Incorrect/Expired"] == "CHECKED") {
	
		count++;
		
    }
	
	
	 if (thisArr[wfProcess + "." + wfTask + ".Supplier Not Identified"] == "CHECKED") {
	
		count++;
		
    }
	
	 if (thisArr[wfProcess + "." + wfTask + ".Security Time Period"] == "CHECKED") {
	
		count++;

    }
	
	 if (thisArr[wfProcess + "." + wfTask + ".Irrevocable Letter of Credit Time Period"] == "CHECKED") {
	
		count++;
		
    }
	
	
	 if (thisArr[wfProcess + "." + wfTask + ".CHECKED"] == "CHECKED") {
	
		count++;
	
    }

    logDebug("Count Value: " + count);

	return count;

}