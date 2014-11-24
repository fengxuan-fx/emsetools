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

var recordType = aa.env.getValue("recordType");
var recordSubType = aa.env.getValue("recordSubType");
var reportNameFor95 = aa.env.getValue("reportNameFor95");
var reportNameFor50 = aa.env.getValue("reportNameFor50");
var emailTemplateFor95 = aa.env.getValue("emailTemplateFor95");
var emailTemplateFor50 = aa.env.getValue("emailTemplateFor50");
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");
var reportNameForSet = aa.env.getValue("reportNameForSet");
var currentUserID = "admin";
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var toEmailAddressForSetReport = lookup("EMAIL ADDRESS FOR CONSOLIDATED REPORT", "emailAddress");
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
	emptyCt1.setCategory("License");
	emptyCm1.setCapType(emptyCt1);
	var vCapList;
	var emptyGISArray = new Array();
	var tDate=new Date();
	var dateString = (tDate.getMonth() + 1) + "/" + tDate.getDate() + "/" + tDate.getFullYear();
	var existingSet;
	var flagForRecordSubType;
	var setID1;	
	var setID2;
	var emailTemplateName;
	var renewalSetFor95;
	var renewalSetFor50;
		
	if(recordSubType=="Broker")
	{
		emailTemplateName="APPLICATION RECEIVED" ;
	}	
	else if(recordSubType=="Distributor")
	{
		emailTemplateName="APPLICATION RECEIVED" ;
	}
	else if(recordSubType=="Milk Hauler")
	{
		emailTemplateName="APPLICATION RECEIVED" ;
	}
	else if(recordSubType=="SmallStore Opertng Distributor")
	{
		emailTemplateName="APPLICATION RECEIVED" ;
	}
	else if(recordSubType=="Store Selling Wholesale")
	{
		emailTemplateName="APPLICATION RECEIVED" ;
	}
	
	logDebug("Template name : " + emailTemplateName);
 
	//Generate set id
	var recordSubTypeUpCase = recordSubType.toUpperCase();
 
	//setID1=  recordSubTypeUpCase + "_" + dateString + "_" + "RENEWALNOTICE60DAYSPRIOR";
	
	setID1=  recordSubTypeUpCase + "_" + dateString + "_" + "RENEWALNOTICE95DAYSPRIOR";
	setID2= recordSubTypeUpCase + "_" + dateString + "_" + "RENEWALNOTICE50DAYSPRIOR";
	
	var setDescription= recordSubType + " " + "-" + " " + "Renewal";
	
	var setType=setDescription;
	
	
	var vCapListResult = aa.cap.getCapListByCollection(emptyCm1, null, null, null, null, null, emptyGISArray);
	if (vCapListResult.getSuccess())
	{
		vCapList = vCapListResult.getOutput();
	}	
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + vCapListResult.getErrorType() + ":" + vCapListResult.getErrorMessage());
	}
	for (thisCap in vCapList)
	{
		var flagFor50 = 0;
		var flagFor95 = 0;
		var capId = aa.cap.getCapID(vCapList[thisCap].getCapID().getID1(),vCapList[thisCap].getCapID().getID2(),vCapList[thisCap].getCapID().getID3()).getOutput();
		logDebug("Cap ID: " + capId);
		
		var license = aa.cap.getCap(capId).getOutput();
		
		var licenseID = license.getCapID();
		
		var b1ExpResultRec=aa.expiration.getLicensesByCapID(licenseID);
		
		if(b1ExpResultRec.getSuccess())
		{
			b1ExpResult=b1ExpResultRec.getOutput();
			var b1Status = b1ExpResult.getExpStatus();
			var expDate = b1ExpResult.getExpDate();
			if (expDate) var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			var oneDay = 24*60*60*1000;
			var addDays = new Date(Date.parse(b1ExpDate));
			
			var today = new Date();
    		var dd = today.getDate();
    		var mm = today.getMonth()+1; //January is 0!

    		var yyyy = today.getFullYear();
    		if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
			var todayDate = new Date(Date.parse(today));
			
			
			var condition = Math.round(Math.abs((todayDate.getTime() - addDays.getTime())/(oneDay)));
			logDebug("Condition for Time" + condition);
			
			if(condition == 95)
			{
				if(b1Status == "About to Expire")
				{
					flagFor95 = 1;
					
					//runRenewalReport(reportName, licenseID.getCustomID());
					//setEmailParameters(license, emailTemplateName,reportName);
				}
			}
			
			if(condition == 50)
			{
				if(b1Status == "About to Expire")
				{
					flagFor50 = 1;
				
					//runRenewalReport(reportName, licenseID.getCustomID());
					//setEmailParameters(license, emailTemplateName,reportName);
				}
			}
			
			if(flagFor95 == 1 || flagFor50 == 1)
			{
				if(flagFor95 == 1)
				{
					var checkLicExistsFor95 = 0;
					renewalSetFor95=aa.set.getSetByPK(setID1);
					if(renewalSetFor95.getSuccess())
					{
						renewalSetFor95=renewalSetFor95.getOutput();
						var updateSetFor95= new capSet(renewalSetFor95.getSetID());
						updateSetFor95.status="Pending";
						updateSetFor95.comment="Processing";
						updateSetFor95.update();
						
						//Check if record exists in the set
						var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor95.getSetID());
						var array=new Array();
						array=setMembers.getOutput();
						var licID=licenseID.getID1() + "-" + licenseID.getID2() + "-" + licenseID.getID3();
						for(i=0;i<array.size();i++)
						{
							var setMember=array.get(i);
							setMember=setMember.toString();
							if(setMember== licID)
							{
								logDebug("Record exists in set");
								checkLicExistsFor95= 1;
								break;
							}
						}
					}
					else
					{
						var createSetResult1= createSetForBatch(setID1,setDescription, setType, "Pending", "Processing", currentUserID);
						logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
						renewalSetFor95 = aa.set.getSetByPK(setID1);
						if(renewalSetFor95.getSuccess())
						{
							renewalSetFor95 = renewalSetFor95.getOutput();
						}
					}
								
					if(checkLicExistsFor95 == 0)
					{
						var addResult= aa.set.addCapSetMember((renewalSetFor95.getSetID()),licenseID);
						logDebug("Add set result: " + addResult.getSuccess());
						if(licenseID.getCustomID() != null){
						runRenewalReport(license,reportNameFor95, licenseID.getCustomID(), emailTemplateFor95, b1ExpDate, 95);
						}
						else{
						logDebug("ERROR MESSAGE: Cap ID is null");
						}
						
						
					}
					else
					{
						logDebug("Record already exists in set");
					}
				}
				
				if(flagFor50 == 1)
				{
					var checkLicExistsFor50 = 0;
					renewalSetFor50=aa.set.getSetByPK(setID2);
					if(renewalSetFor50.getSuccess())
					{
						renewalSetFor50=renewalSetFor50.getOutput();
						var updateSetFor50= new capSet(renewalSetFor50.getSetID());
						updateSetFor50.status="Pending";
						updateSetFor50.comment="Processing";
						updateSetFor50.update();
						
						
						var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor50.getSetID());
						var array=new Array();
						array=setMembers.getOutput();
						var licID= licenseID.getID1() + "-" + licenseID.getID2() + "-" + licenseID.getID3();
						for(i=0;i<array.size();i++)
						{
							var setMember=array.get(i);
							setMember=setMember.toString();
							if(setMember== licID)
							{
								logDebug("Record exists in set");
								checkLicExistsFor50 = 1;
								break;
							}
						}
					}
					else
					{
						var createSetResult2= createSetForBatch(setID2,setDescription, setType, "Pending", "Processing", currentUserID);
						logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
						renewalSetFor50 = aa.set.getSetByPK(setID2);
						if(renewalSetFor50.getSuccess())
						{
							renewalSetFor50 = renewalSetFor50.getOutput();
						}
					}
								
					if(checkLicExistsFor50 == 0)
					{
						var addResult= aa.set.addCapSetMember((renewalSetFor50.getSetID()),licenseID);
						logDebug("Add set result: " + addResult.getSuccess());
						if(licenseID.getCustomID() != null){
						runRenewalReport(license,reportNameFor50, licenseID.getCustomID(),emailTemplateFor50,b1ExpDate,50);
						}
						else{
						logDebug("ERROR MESSAGE: Cap ID is null");
						}
						
					}
					else
					{
						logDebug("Record already exists in set");
					}
				}
			}
		}
	}
	
	//Generate set report
	/*
	if(renewalSetFor95)
	{
		var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor95.getSetID());
		var array=new Array();
		if(setMembers != null)
		{
			array=setMembers.getOutput();
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
		if(array.size() > 0)
		{
			var license;
			for(var j=0; j<array.size(); j++)
			{ 
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				break;
   
			}
			var licenseID = license.getCapID();
			runSetReport(emailTemplateForSet, license, reportNameForSet, licenseID.getCustomID(), renewalSetFor95.getSetID());
		}
	}
 
 
	if(renewalSetFor50)	
	{
		var setMembersForLate=aa.set.getCAPSetMembersByPK(renewalSetFor50.getSetID());
		var array=new Array();
		if(setMembersForLate != null)
		{
			array=setMembersForLate.getOutput();
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
		if(array.size() > 0)
		{
			var license;
			for(var j=0; j<array.size(); j++)
			{                             
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				break;
			}
			var licenseID = license.getCapID();
			runSetReport(emailTemplateForSet, license, reportNameForSetLateNotice, licenseID.getCustomID(), renewalSetFor50.getSetID());  
		}
	}
	*/
 
	if(renewalSetFor95)
	{
		var setUpdateFor95= new capSet(renewalSetFor95.getSetID());
		setUpdateFor95.status="Completed";
		setUpdateFor95.comment="Successfully processed";
		setUpdateFor95.update();
	}
	
	if(renewalSetFor50)
	{
		var setUpdateFor50= new capSet(renewalSetFor50.getSetID());
		setUpdateFor50.status="Completed";
		setUpdateFor50.comment="Successfully processed";
		setUpdateFor50.update();
	}
}

function runRenewalReport(license,reportName,customID,emailTemplateName,expDate,noOfDays)
{
     var parameters=aa.util.newHashMap();
     parameters.put("ALT_ID", customID);
	 parameters.put("SET_ID", "ALL");
     logDebug("Report parameters for license: " + parameters);
	report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
	logDebug("Report: " + report);
	if(report){
   
    report.setCapId(customID);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName, currentUserID);
    //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
	logDebug("Permission" + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
    {
        //aa.print("User has permission");    
        var reportResult=aa.reportManager.getReportResult(report);
		logDebug("Report Result" + reportResult);
        if(reportResult)
        {
            reportResult=reportResult.getOutput();
            logDebug("Report result: " + reportResult);
            reportFile=aa.reportManager.storeReportToDisk(reportResult);
            reportFile=reportFile.getOutput();
            logDebug("Report File: " +reportFile);
			if(reportFile)
			{
				setEmailParameters(license,emailTemplateName,reportFile,expDate,noOfDays);
			}
        }       
    }
	
	}
	else{
	logDebug("ERROR MESSAGE: Report result is null");
	}
}

function setEmailParameters(license,emailTemplateName,reportFile, expDate, noOfDays)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";
	var rFiles = new Array();
	//rFiles.push(reportFile);
	
	var lateDate = new Date(Date.parse(expDate));
	lateDate.setDate(lateDate.getDate() - noOfDays);
	
	var currDate = new Date();
	var currentYear = currDate.getFullYear();
	var oneDay = 24*60*60*1000;
	var daysLate = Math.abs(Math.round((lateDate.getTime() - currDate.getTime())/oneDay));
	daysLate = daysLate.toString();
	logDebug("Days late: " + daysLate);
	
	var reAppDate = new Date();
	reAppDate.setDate(reAppDate.getDate() + 21);
	var reAppDateString = (reAppDate.getMonth() + 1) + "/" + reAppDate.getDate() + "/" + reAppDate.getFullYear();
	
	var capId = license.getCapID();
	var capContactResult=aa.people.getCapContactByCapID(capId);
	if(capContactResult.getSuccess())
	{
		capContactResult=capContactResult.getOutput();
		 for(yy in capContactResult)
		{
			var peopleModel=capContactResult[yy].getPeople();
			if(peopleModel.getContactType()=="Business" && peopleModel.getFlag().equalsIgnoreCase("Y"))
			{
				toEmailAddress=peopleModel["email"];
				logDebug("Email Address: " + toEmailAddress);
				break;
			}
		}
		if(toEmailAddress)
		{
			var params=aa.util.newHashtable();
            params.put("$$licenseType$$",license.getCapType().getAlias());
            params.put("$licAltID$$",capId.getCustomID());
            params.put("$$expDate$$", expDate);
			params.put("$$daysLate$$",  daysLate);
			params.put("$$currentYear$$", currentYear);
			params.put("$$reAppDate$$", reAppDateString);
            sendNotification("noreply@accela.com",toEmailAddress,"", emailTemplateName ,params,rFiles,capId);
        }
    } 
}

function runSetReport(emailTemplateName, license, reportName, customID, setID)
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

function setEmailParametersForSet(license, emailTemplateName,reportFile, setID)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
   // var toEmailAddress = "aditi@gcomsoft.com";
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
	
	if(toEmailAddressForSetReport)
	{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
        
            sendNotification("noreply@accela.com",toEmailAddressForSetReport,"",emailTemplateName,params,rFiles,capId);
    }
}