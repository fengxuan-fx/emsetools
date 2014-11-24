/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 400;         // number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));


function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

batchJobID = 0;
if (batchJobResult.getSuccess()) {
   batchJobID = batchJobResult.getOutput();
   logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
   logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var recordType = aa.env.getValue("recordType");
var recordSubType = aa.env.getValue("recordSubType");
var reportName = aa.env.getValue("reportName");
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
logDebug("Start of Job");
mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
{
	var emptyCm1 = aa.cap.getCapModel().getOutput();
	var emptyCt1 = emptyCm1.getCapType();
	emptyCt1.setGroup("Licenses");
	emptyCt1.setType(recordType);
	emptyCt1.setSubType(recordSubType);
	emptyCt1.setCategory("Application");
	emptyCm1.setCapType(emptyCt1);
	
	var emptyCm2 = aa.cap.getCapModel().getOutput();
	var emptyCt2 = emptyCm2.getCapType();
	emptyCt2.setGroup("Licenses");
	emptyCt2.setType(recordType);
	emptyCt2.setSubType(recordSubType);
	emptyCt2.setCategory("Renewal");
	
	var vCapList1;
	var vCapList2;
	var emptyGISArray = new Array();
	var tDate=sysDateMMDDYYYY;
	var setID1;
	var setID2;
	
	setID1 = "Final Notice" + " - " + "Security Participation" + "_" + "App" + "_" + tDate;
	setID2 =  "Final Notice" + " - " + "Security Participation" + "_" + "Renewal" + "_" + tDate;
	
	logDebug("Set ID1: " + setID1);
	logDebug("Set ID2: " + setID2);
	var setDescription= recordSubType + " " + "-" + " " + "Final Notice";
	logDebug("Description:" + setDescription);
	var setType=setDescription;
	
	var appSet;
	var renewalSet;
	
	var vCapListResult1 = aa.cap.getCapListByCollection(emptyCm1, null, null, null, null, null, emptyGISArray);
	if (vCapListResult1.getSuccess())
	{
		vCapList1 = vCapListResult1.getOutput();
	}	
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + vCapListResult1.getErrorType() + ":" + vCapListResult1.getErrorMessage());
	}
	
	var vCapListResult2 = aa.cap.getCapListByCollection(emptyCm2, null, null, null, null, null, emptyGISArray);
	if (vCapListResult2.getSuccess())
	{
		vCapList2 = vCapListResult2.getOutput();
	}	
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + vCapListResult2.getErrorType() + ":" + vCapListResult2.getErrorMessage());
	}
	
	//For Farm Product App
	for (thisCap in vCapList1)
	{
		var capId = aa.cap.getCapID(vCapList1[thisCap].getCapID().getID1(),vCapList1[thisCap].getCapID().getID2(),vCapList1[thisCap].getCapID().getID3()).getOutput();
		logDebug("Cap ID: " + capId);
		var license= aa.cap.getCap(capId).getOutput();
		var recID = license.getCapID();
		var taskDate;
		var flag=0;
		
		var workflowResult = aa.workflow.getTasks(recID);
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
			var taskDate;
			if (desc =="Pre-liminary Security Review" && disp =="No Security Required")
			{
				taskDate = fTask.getStatusDate();
				flag=1;
			}
			if(desc == "Final Review" && fTask.getActiveFlag().equalsIgnoreCase("Y") && flag==1)
			{
				//add date condition
				if (taskDate) 
				{
					var oneDay = 24*60*60*1000;
					var addDays = new Date(Date.parse(taskDate));
				
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth()+1; //January is 0!
	
					var yyyy = today.getFullYear();
					if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
					var todayDate = new Date(Date.parse(today));

					var condition = Math.round(Math.abs((todayDate.getTime() - addDays.getTime())/(oneDay)));
					logDebug("Condition for Time" + condition);
		
					if(condition >= 21)
					{
						runReportForFinalNotice(reportName, recID.getCustomID());
						appSet = aa.set.getSetByPK(setID1);
						if(appSet.getSuccess())
						{
							appSet= appSet.getOutput();
							var updateAppSet= new capSet(appSet.getSetID());
							updateAppSet.status="Pending";
							updateAppSet.comment="Processing";
							updateAppSet.update();
						}
						else
						{
							var createSetResult1= createSet(setID1,setDescription, setType, "Pending", "Processing");
							logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
							appSet = aa.set.getSetByPK(setID1); 
							if(appSet.getSuccess())
							{
								appSet = appSet.getOutput();
							}
						}
						if(appSet)
						{
							var addResult= aa.set.addCapSetMember((appSet.getSetID()),recID);
						}
					}
				
				}
			}
		}
	}
	
	//For Farm Products Renewal
	for (thisCap in vCapList2)
	{
		var capId = aa.cap.getCapID(vCapList2[thisCap].getCapID().getID1(),vCapList2[thisCap].getCapID().getID2(),vCapList2[thisCap].getCapID().getID3()).getOutput();
		logDebug("Cap ID: " + capId);
		var license= aa.cap.getCap(capId).getOutput();
		var recID = license.getCapID();
		var taskDate;
		var flag=0;
		
		var workflowResult = aa.workflow.getTasks(recID);
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
			var taskDate;
			if (desc =="Pre-liminary Security Review" && disp =="No Security Required")
			{
				taskDate = fTask.getStatusDate();
				flag=1;
			}
			if(desc == "Final Review" && fTask.getActiveFlag().equalsIgnoreCase("Y") && flag==1)
			{
				if(taskDate)
				{
					//var b1TaskDate = taskDate.getMonth() + "/" + taskDate.getDayOfMonth() + "/" + taskDate.getYear();
					var oneDay = 24*60*60*1000;
					var addDays = new Date(Date.parse(b1TaskDate));
				
					var today = new Date();
					var dd = today.getDate();
					var mm = today.getMonth()+1; //January is 0!
	
					var yyyy = today.getFullYear();
					if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
					var todayDate = new Date(Date.parse(today));

					var condition = Math.round(Math.abs((todayDate.getTime() - addDays.getTime())/(oneDay)));
					logDebug("Condition for Time" + condition);
					
					if(condition >= 21)
					{
						runReportForFinalNotice(reportName, recID.getCustomID());
						renewSet = aa.set.getSetByPK(setID2);
						if(renewSet.getSuccess())
						{
							renewSet= renewSet.getOutput();
							var updateRenewSet= new capSet(renewSet.getSetID());
							updateRenewSet.status="Pending";
							updateRenewSet.comment="Processing";
							updateRenewSet.update();
						}
						else
						{
							var createSetResult2= createSet(setID2,setDescription, setType, "Pending", "Processing");
							logDebug("Create Set Result for " + setID2 + ":  " + createSetResult2);
							renewSet = aa.set.getSetByPK(setID2); 
							if(renewSet.getSuccess())
							{
								renewSet = renewSet.getOutput();
							}
						}
						if(renewSet)
						{
							var addResult= aa.set.addCapSetMember((renewSet.getSetID()),recID);
						}
					}
				}
			}
		}
	}
}

function runReportForFinalNotice(reportName, itemCap)
{
	var parameters=aa.util.newHashMap();
     
   parameters.put("b1.b1_alt_id", itemCap);
   logDebug("Report parameters for license: " + parameters);
	
	report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
	
	logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,currentUserID);
	logDebug("Permission: " + checkPermission);
   
    if(checkPermission.getOutput().booleanValue())
    {
        var reportResult=aa.reportManager.getReportResult(report);
        if(reportResult)
        {
            reportResult=reportResult.getOutput();
            logDebug("Report result: " + reportResult);
            reportFile=aa.reportManager.storeReportToDisk(reportResult);
            reportFile=reportFile.getOutput();
            logDebug("Report File: " +reportFile);
        }       
    }
}
