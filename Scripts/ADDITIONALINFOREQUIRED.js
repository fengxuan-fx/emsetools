/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:  
|
| Version 2.0 - Base Version. 11/01/14 JHS 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 5000;         // number of seconds allowed for batch processing, usually < 5*60
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
var recordSubType = aa.env.getValue("recordSubType");	//App sub type
var reportName = aa.env.getValue("reportName");	//Report name to be used for each set member
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");	//Email template for sending out the consolidated report
var reportNameForSet = aa.env.getValue("reportNameForSet");		//Report name to be used for the consolidated report
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var toEmailAddress = lookup("EMAIL ADDRESS FOR CONSOLIDATED REPORT", "emailAddress");
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
	var tDate= new Date();
	var str="Additional Info Required";
	var flag=0;
	var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	
	//Generate setID and check if set exists with pending status
	for(var i=0;;i++)
	{
		var setID=str + " - " + recordSubType + "_" + dateString + "_" + (i+1);			//Generate set ID
		var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
		setScriptSearch.setSetID(setID);
		
		var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);
		
		if (setHeaderList.getSuccess()) 
		{
			setHeaderList = setHeaderList.getOutput();
			if(setHeaderList.get(0).getSetStatus().equalsIgnoreCase("Pending"))
			{
				setID4Process = String(setHeaderList.get(0).getSetID());
				logDebug("Set ID:" + setID4Process);		//Get the set ID to work on
				flag=1;
				break;
			}
			else if (setHeaderList.get(0).getSetStatus().equalsIgnoreCase("Completed"))
			{
				continue;
			}
		}
		else
		{
			break;
		}
	}
	
	if(flag==1)
	{
		//Get set members
		var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
		var array=new Array();
		var record;
		var recordID;
		
		if(setMembers != null)
		{
			array=setMembers.getOutput();
			logDebug("Number of CAP members: " + array.size());
			
			/*var setID= str + " - " + recordSubType + "_" + tDate + "_" + "30DaysNotice";
			var setDescription= str + " - " + recordSubType;
			logDebug("Description:" + setDescription);
			var setType= setDescription;
	
			var additionalInfo30Days=aa.set.getSetByPK(setID);
			if(additionalInfo30Days.getSuccess())
			{
				additionalInfo30Days=additionalInfo30Days.getOutput();
				var updateSet= new capSet(setID);
				updateSet.status="Pending";
				updateSet.comment="Processing";
				updateSet.update();
			}
			else
			{
				var createSetResult= createSet(setID,setDescription, setType, "Pending", "Processing");
			}*/
			
			//Generate report for each set member
			for(var j=0; j<array.size(); j++)
			{
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				var licenseID = license.getCapID();
				//Generate report
				runLicReport(license,reportName,licenseID.getCustomID());
		
				var workflowResult = aa.workflow.getTasks(licenseID);
				if (workflowResult.getSuccess())
				{
					wfObj = workflowResult.getOutput();
				}
				else
				{ 
					logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; 
				}

				/*for (i in wfObj)
				{ 
					logDebug("**** " + i + " ****");
					var fTask = wfObj[i]; 
					logDebug("WorkFlow Task" + fTask.toString());
					var desc = fTask.getTaskDescription(); 
					logDebug("DESC: " + desc);
					var disp = fTask.getDisposition(); 
					logDebug("DISP: " + disp);
					var taskDate = fTask.getStatusDate();
					logDebug("DATE: " + taskDate);
					var newDate = new Date();
					var condition = Math.round(Math.abs((newDate.getTime() - taskDate.getTime())/(oneDay)));
					logDebug("Difference: " + condition);
					if(desc == "Additional Info Required" && condition > 30)
					{
						var addResult= aa.set.addCapSetMember((additionalInfo30Days.getSetID()),licenseID);
						logDebug("Add set result: " + addResult.getSuccess());
						runTestReport("ReportName", capId.getCustomID());
					}
				} */		
			}
		
			//Generating report for the whole set
			if(array.size() > 0)
			{
				logDebug("Executing code for set report");
				for(var j=0; j<1; j++)
				{                             
					var setMember=array.get(j);
					setMember=setMember.toString();
					var ids=new Array();
					ids=setMember.split("-");
					record = aa.cap.getCap(ids[0], ids[1], ids[2]);
					record= record.getOutput();
					recordID = record.getCapID();
				}
			
				runSetReport(emailTemplateForSet,reportNameForSet,setID4Process, recordID.getCustomID(), record);
			}
		}
		
		//Update the set status and comments
		var setUpdate= new capSet(setID4Process);
		setUpdate.status="Completed";
		setUpdate.comment="Successfully processed";
		setUpdate.update();
	}
}

//Generate report for each set member
function runLicReport(license,reportName,itemCap)
{
     var parameters=aa.util.newHashMap();
    parameters.put("ALT_ID", itemCap);
	parameters.put("SET_ID", "ALL");
    //logDebug("Report parameters for license: " + parameters);
    
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
    logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
	//logDebug("Permission: " + checkPermission);
	
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

//Generate consolidated report for all set members and send an email with the report attached
function runSetReport(emailTemplateName, reportName, setID, customID, license)
{
		var parameters=aa.util.newHashMap();
		parameters.put("ALT_ID", "ALL");
		parameters.put("SET_ID", setID);
		logDebug("Report parameters for license: " + parameters);

		report=aa.reportManager.getReportInfoModelByName(reportName);
		report=report.getOutput();
		report.setCapId(customID);
		report.setModule("Licenses");
		report.setReportParameters(parameters);
		//aa.print("Report ID: " + report.getReportId());
		logDebug("Report parameters: "+ report.getReportParameters());
		var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
		//logDebug("Permission: " + checkPermission);
		logDebug("Permission: " + checkPermission.getOutput().booleanValue());
		if(checkPermission.getOutput().booleanValue())
		{
		var reportResult=aa.reportManager.getReportResult(report);
		if(reportResult)
		{
			reportResult=reportResult.getOutput();
			logDebug("Report result for set report: " + reportResult);
			reportFile=aa.reportManager.storeReportToDisk(reportResult);
			reportFile=reportFile.getOutput();
			logDebug("Report File for set report: " +reportFile);
			if(reportFile)
			{
				setEmailParametersForSet(license,emailTemplateName,reportFile, setID);
			}
		}
	}
}

//Generate email for sending out the consolidated report
function setEmailParametersForSet(license, emailTemplateName,reportFile,setID)
{
  var sendEmailToContactType = "Business"; //Applicant";
  var FromEmailAddress = "noreply@accela.com";
  //var toEmailAddress = "aditi@gcomsoft.com";
  var currentDate = new Date();
  var currentDateString = (currentDate.getMonth() +1) + "/" +  currentDate.getDate() + "/" + currentDate.getFullYear();
  var rFiles = new Array();
  rFiles.push(reportFile);
 
  var capId = license.getCapID();
  
  var licenseSet  = aa.set.getSetByPK(setID);
  if(licenseSet.getSuccess())
  {
   licenseSet = licenseSet.getOutput();
   setTitle = licenseSet.getSetTitle();
  }
  
  if(toEmailAddress)
  {
   var params=aa.util.newHashtable();
   params.put("$$setID$$", setID);
   params.put("$$CURRENTDATE$$",currentDateString);
   params.put("$$setName$$", setTitle);
   sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
  }
}