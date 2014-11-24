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
var setType = aa.env.getValue("setType");
var reportNameForInsp = aa.env.getValue("reportNameForInsp");
var reportNameForSet = aa.env.getValue("reportNameForSet");
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");
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
	var setID4Process;
	
	var dateString = (tDate.getMonth() + 1) + "/" + tDate.getDate() + "/" + tDate.getFullYear();
	//for(i=0;i<5;i++)
	{
		var setID=setType + "_" +  dateString;
		var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
		setScriptSearch.setSetID(setID);
		setScriptSearch.setSetStatus("Pending");
		var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);
		if (setHeaderList.getSuccess()) 
		{
			var setList = setHeaderList.getOutput();
			setID4Process = String(setList.get(0).getSetID());
			logDebug("Set ID:" + setID4Process);
		}
	}
	
	if(setID4Process)
	{
		var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
		var array=new Array();
		if(setMembers != null)
		{
			array=setMembers.getOutput();
			logDebug("Number of CAP members: " + array.size());
			
			for(j=0;j<array.size();j++)
			{
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				var estRecord = aa.cap.getCap(ids[0], ids[1], ids[2]);
				estRecord= estRecord.getOutput();
				var estId = estRecord.getCapID();
				var custId= estId.getCustomID();
				logDebug("Set Member " + (j+1) + ":" + custId);
		
				var inspResultObj = aa.inspection.getInspections(estId);
			
				if (inspResultObj.getSuccess())
				{
					var inspList = inspResultObj.getOutput();
					for (xx in inspList)
					{
						var inspId = inspList[xx].getIdNumber();
						
						//Run report for each inspection based on its type
						if(inspList[xx].getInspectionType().equalsIgnoreCase("Nursery Dealer") || inspList[xx].getInspectionType().equalsIgnoreCase("Nursery Dealer Re-Inspection") || inspList[xx].getInspectionType().equalsIgnoreCase("Nursery Grower") || inspList[xx].getInspectionType().equalsIgnoreCase("Nursery Grower Re-Inspection"))
						{
							if (inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Issued"))
							{ 
								runInspectionReport("Quarantine Order", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Partially Released") || inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Released"))
							{
								runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Violation of Quarantine"))
							{
								//runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Unlicensed Establishment"))
							{
								//runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							runInspectionReport("Plant Inspection Report - Nursery", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Commodity") || inspList[xx].getInspectionType().equalsIgnoreCase("Commodity Re-Inspection"))
						{
							if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale"))
							{
								runInspectionReport("Stop Sale Order", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale Partially Released") || inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale Released"))
							{
								runInspectionReport("Stop Sale Order Release",custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Violation of Stop Sale"))
							{
								runInspectionReport("Notice of Violation Stop Sale Order",custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Unlicensed labeler"))
							{
								//runInspectionReport("Notice of Violation Stop Sale Order",custId, inspId);
							}
							runInspectionReport("Commodity Inspection Report", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Ammonium Nitrate") || inspList[xx].getInspectionType().equalsIgnoreCase("Ammonium Nitrate Re-Inspection"))
						{
							if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale"))
							{
								runInspectionReport("Stop Sale Order", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale Partially Released") || inspList[xx].getInspectionStatus().equalsIgnoreCase("Stop Sale Released"))
							{
								runInspectionReport("Stop Sale Order Release",custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Violation of Stop Sale"))
							{
								runInspectionReport("Notice of Violation Stop Sale Order",custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Unlicensed labeler"))
							{
								//runInspectionReport("Notice of Violation Stop Sale Order",custId, inspId);
							}
							runInspectionReport("Ammonium Nitrate Inspection Report", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Emerald Ash Borer Compliance Agreement Interview") && inspList[xx].getInspectionStatus().equalsIgnoreCase("Issued"))
						{
							//runInspectionReport("Emerald Ash Borer Compliance Agreements", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Emerald Ash Borer") || inspList[xx].getInspectionType().equalsIgnoreCase("Emerald Ash Borer Re-Inspection"))
						{
							if (inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Issued"))
							{ 
								runInspectionReport("Quarantine Order", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Partially Released") || inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Released"))
							{
								runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Violation of Quarantine"))
							{
								//runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							runInspectionReport("Emerald Ash Borer Compliance Inspection Report", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Plum Pox Compliance Agreement Interview") && inspList[xx].getInspectionStatus().equalsIgnoreCase("Issued"))
						{
							//runInspectionReport("Emerald Ash Borer Compliance Inspection Report", custId, inspId);
						}
						else if(inspList[xx].getInspectionType().equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance") || inspList[xx].getInspectionType().equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance Re-Inspection"))
						{
							if (inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Issued"))
							{ 
								runInspectionReport("Quarantine Order", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Partially Released") || inspList[xx].getInspectionStatus().equalsIgnoreCase("Quarantine Released"))
							{
								runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							else if(inspList[xx].getInspectionStatus().equalsIgnoreCase("Violation of Quarantine"))
							{
								//runInspectionReport("Quarantine Order Release", custId, inspId);
							}
							runInspectionReport("Plum Pox Virus Eradication Program Compliance", custId, inspId);
						}
					}
				}
			}
		
			if(array.size()>0)
			{
				var estRec;
				var estRecID;
				
				for(var j=0; j<1; j++)
				{                             
					var setMember=array.get(j);
					setMember=setMember.toString();
					var ids=new Array();
					ids=setMember.split("-");
					estRec = aa.cap.getCap(ids[0], ids[1], ids[2]);
					estRec= estRec.getOutput();
					estRecID = estRec.getCapID();
				}
				
				runSetReport(emailTemplateForSet,"Ammonium Nitrate Inspection Report Batch" ,setID4Process, estRecID.getCustomID(),estRec);
				
			}
			
			var setUpdate= new capSet(setID4Process);
			setUpdate.status="Completed";
			setUpdate.comment="Successfully processed";
			setUpdate.update();
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
	}
}

function runInspectionReport(reportName,itemCap,inspID)
{
	logDebug("Inside runReport");
	var parameters=aa.util.newHashMap();
	parameters.put("ALT_ID",itemCap);
	parameters.put("INSPECTION_ID",inspID.toString());
	parameters.put("SET_ID", "ALL"); 
				
	report=aa.reportManager.getReportInfoModelByName(reportName);
	report=report.getOutput();
	report.setCapId(itemCap);
	report.setModule("Licenses");
	report.setReportParameters(parameters);
	logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName, "admin");
	logDebug("Permission: " +	checkPermission.getOutput().booleanValue());
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

function runSetReport(emailTemplate,reportName,setID,itemCap,license)
{
     logDebug("Inside runSetReport");
	 var parameters=aa.util.newHashMap();
	 
    parameters.put("ALT_ID", "ALL");
	parameters.put("INSPECTION_ID", "ALL");
	parameters.put("SET_ID", setID); 
     logDebug("Report parameters for license: " + parameters);
    
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
  
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
    
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
	
    logDebug("Permission: " + checkPermission.getOutput().booleanValue());
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
			if(reportFile)
			{
				setEmailParameters(license,emailTemplate,reportFile,setID);
			}
        }       
    }
}

function setEmailParameters(license, emailTemplateName,reportFile,setID)
{
	logDebug("Inside setEmailParameters");
	
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "rfoggo@accela.com";
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
	
	if(toEmailAddress)
	{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
         
            sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
    }
    
}