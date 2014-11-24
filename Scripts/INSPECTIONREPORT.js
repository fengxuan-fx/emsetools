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
maxSeconds = 4.5 * 300;         // number of seconds allowed for batch processing, usually < 5*60
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
var inspectionType = aa.env.getValue("inspectionType");	//App sub type
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
	var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	var setMemberArray =  new Array();
	var capID;
	//Generate set ID
	var setID = inspectionType.toUpperCase() + "_" + dateString;
	logDebug("Set ID: " + setID);
	//var setDescription = setString + " Inspection";
	
	//Get the required set
	var setResult = aa.set.getSetByPK(setID);
	if(setResult.getSuccess())
	{
		setResult=setResult.getOutput();
		var setMembers=aa.set.getCAPSetMembersByPK(setResult.getSetID());
		setMemberArray = setMembers.getOutput();
		for(i = 0; i<setMemberArray.size(); i++)
		{
			var setMember = setMemberArray.get(i);
			setMember = setMember.toString();
			var ids=new Array();
			ids=setMember.split("-");
			var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			capID = license.getCapID();
			logDebug("Cap ID: " + capID);
			break;
		}
		
		runSetReport(setID, capID);
		
		var setUpdate= new capSet(setID);
		setUpdate.status="Completed";
		setUpdate.comment="Successfully processed";
		setUpdate.update();
	}
}

function runSetReport(setID, capID)
{
	var parameters=aa.util.newHashMap();
	parameters.put("ALT_ID", "ALL");
	parameters.put("INSPECTION_ID", "ALL");
	parameters.put("SET_ID", setID);

	report=aa.reportManager.getReportInfoModelByName(reportNameForSet);
	report=report.getOutput();
	//report.setCapId(customID);
	report.setModule("Licenses");
	report.setReportParameters(parameters);	
	logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportNameForSet,"admin");
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
				setEmailParametersForSet(reportFile, setID,capID);
			}
		}
	}
}

function setEmailParametersForSet(reportFile,setID,capID)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    //var toEmailAddress = "aditi@gcomsoft.com";

	var setTitle;
	var currentDate = new Date();
	var currentDateString = (currentDate.getMonth() +1) + "/" +  currentDate.getDate() + "/" + currentDate.getFullYear();
	var rFiles = new Array();
	rFiles.push(reportFile);
	
	var licenseSet  = aa.set.getSetByPK(setID);
	if(licenseSet.getSuccess())
	{
		licenseSet = licenseSet.getOutput();
		setTitle = licenseSet.getSetTitle();
	}
	
	//Set email parameters and send email notification
	if(toEmailAddress)
	{
			logDebug("To email address: " + toEmailAddress);
			
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
         
            sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateForSet,params,rFiles,capID);
    }
    
}