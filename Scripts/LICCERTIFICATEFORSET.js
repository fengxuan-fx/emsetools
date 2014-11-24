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
var recordSubType = aa.env.getValue("recordType");
var reportName = aa.env.getValue("reportName");
var emailTemplate = aa.env.getValue("emailTemplateName");
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

	var tDate= new Date();
	
   var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
  //logDebug("Email Date Parameter: " + (emailDateParameter.getMonth() +1) + "/" + emailDateParameter.getDate() + "/" + emailDateParameter.getFullYear());


	
	var flag=0;
	
	for(var i=0;;i++)
	{
		var setID=recordSubType + "_" + dateString + "_" + (i+1);
		logDebug("ID: " + setID);
		var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
		setScriptSearch.setSetID(setID);
		var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);
		logDebug(setHeaderList.getSuccess());
		if (setHeaderList.getSuccess()) 
		{
			var setList = setHeaderList.getOutput();
			if(setList.get(0).getSetStatus().equalsIgnoreCase("Pending"))
			{
				setID4Process = String(setList.get(0).getSetID());
				logDebug("Set ID:" + setID4Process);
				flag=1;
				break;
			}
			else if(setList.get(0).getSetStatus().equalsIgnoreCase("Completed"))
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
		var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
		var array=new Array();
		var license;
		var licenseID;
		
		if(setMembers != null)
		{
			array=setMembers.getOutput();
			logDebug("Number of CAP members: " + array.size());
			if(array.size()>0)
			{
				for(var j=0; j<1; j++)
				{                             
					var setMember=array.get(j);
					setMember=setMember.toString();
					var ids=new Array();
					ids=setMember.split("-");
					license = aa.cap.getCap(ids[0], ids[1], ids[2]);
					license= license.getOutput();
					licenseID = license.getCapID();
				}
			
				runSetReport(emailTemplate,reportName,setID4Process, licenseID.getCustomID(),license);
			}
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
		
		if(setID4Process)
		{
			var setUpdate= new capSet(setID4Process);
			setUpdate.status="Completed";
			setUpdate.comment="Successfully processed";
			setUpdate.update();
		
		}
	}
}


function runSetReport(emailTemplate,reportName,setID4Process,itemCap,license)
{
     var parameters=aa.util.newHashMap();
     //if(arguments.length==6)
    
        parameters.put("SET_ID", setID4Process);
        //parameters.put("Status", "Active");
        logDebug("Report parameters for license: " + parameters);
    
    /*else if (arguments.length==7)
    {
        parameters.put("b1.b1_alt_id", itemCap.getCustomID());
        parameters.put("cSeqNumber", cSeqNumber);
        //parameters.put("Status", "Active");
        logDebug("Report parameters for contact: " + parameters);
    }*/
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    //aa.print(report);
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
	//logDebug("Permission: " + checkPermission);
    logDebug("Permission: " + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
    {
        //aa.print("User has permission");    
        var reportResult=aa.reportManager.getReportResult(report);
        if(reportResult)
        {
            reportResult=reportResult.getOutput();
            logDebug("Report result: " + reportResult);
            reportFile=aa.reportManager.storeReportToDisk(reportResult);
            reportFile=reportFile.getOutput();
            logDebug("Report File: " +reportFile);
			if(reportFile)
			{
				setEmailParameters(license,emailTemplate,reportFile,setID4Process);
			}
        }       
    }
}

function setEmailParameters(license, emailTemplateName,reportFile,setID)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "aditi@gcomsoft.com";
	var setTitle;
	var currentDate = new Date();
	var currentDateString = (currentDate.getMonth() +1) + "/" +  currentDate.getDate() + "/" + currentDate.getFullYear();
	var rFiles = new Array();
	rFiles.push(reportFile);
	
	var capId = license.getCapID();
	var capContactResult=aa.people.getCapContactByCapID(capId);
	
	var licenseSet  = aa.set.getSetByPK(setID);
	if(licenseSet.getSuccess())
	{
		licenseSet = licenseSet.getOutput();
		setTitle = licenseSet.getSetTitle();
	}
	/*if(capContactResult.getSuccess())
	{
		capContactResult=capContactResult.getOutput();
		 for(yy in capContactResult)
		{
			var peopleModel=capContactResult[yy].getPeople();
			if(peopleModel.getContactType()=="Business")
			{
				toEmailAddress=peopleModel["email"];
				logDebug("Email Address: " + toEmailAddress);
				break;
			}
		}
	}*/
	
	if(toEmailAddress)
	{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
            //params.put("$$licenseType$$",license.getCapType().getAlias());
            //params.put("$licAltID$$",capId.getCustomID());
            //params.put("$$licenseTypeThirdLevel$$",recordSubType);
            sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
    }
    
}