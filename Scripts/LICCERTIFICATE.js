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
var recordSubType = aa.env.getValue("recordType");		//App sub type
var reportName = aa.env.getValue("reportName");		//Report name to be used for each set member
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");		//Email template for sending out the consolidated report
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
  //logDebug("Email Date Parameter: " + (emailDateParameter.getMonth() +1) + "/" + emailDateParameter.getDate() + "/" + emailDateParameter.getFullYear());

	var emailTemplateName;
	var flag=0;
	var licenseForSet;
	var itemCapForSet;
	
	//Generate setID and check if set exists with pending status
	for(var i=0;;i++)
	{
		var setID=recordSubType + "_" + dateString + "_" + (i+1);		//Generate set ID
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
				logDebug("Set ID:" + setID4Process);		//Get the set ID to work on
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
		//Get set members
		var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
		var array=new Array();
		array=setMembers.getOutput();
		logDebug("Number of CAP members: " + array.size());
		
		//Generate license certificate for each set member
		for(var j=0; j<array.size(); j++)
		{                             
			var flagForLicense=0;
			
			var setMember=array.get(j);
			setMember=setMember.toString();
			var ids=new Array();
			ids=setMember.split("-");
			var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			var licenseID = license.getCapID();
			logDebug("Set Member " + (j+1) + ":" + licenseID.getCustomID());
		
			var capContactResult=aa.people.getCapContactByCapID(licenseID);
			if(capContactResult.getSuccess())
			{
				capContactResult=capContactResult.getOutput();
			}
		
			//Check the business contact and ASI fields for Nursery Dealer, Grower and Ammonium Nitrate
			if(recordSubType=="Nursery Grower" || recordSubType=="Nursery Dealer" || recordSubType=="Ammonium Nitrate Fertilizer")
			{
				var asiInfo;
				if(recordSubType=="Ammonium Nitrate Fertilizer")
				{
					asiInfo="ammonium";
				}
				else if(recordSubType=="Nursery Dealer")
				{
					asiInfo=getAppSpecific("Does the Main Location deal in selling plants?", licenseID);
				}
				else if(recordSubType=="Nursery Grower")
				{
					asiInfo=getAppSpecific("Does the Main Location deal in Growing plants?", licenseID);
				}
				logDebug("ASI Info: " + asiInfo);
				if(asiInfo=="Yes" || asiInfo=="ammonium")
				{
					//Check if business contact address has state as "NY"
					for(yy in capContactResult)
					{
						var peopleModel= capContactResult[yy].getPeople();
						if(peopleModel.getContactType()=="Business" )
						{ 
							var capContactScriptModel= capContactResult[yy];
							var capContactModel= capContactScriptModel.getCapContactModel();
							var contactAddress=aa.address.getContactAddressListByCapContact(capContactModel);
							if(contactAddress.getSuccess())
							{	
								contactAddress=contactAddress.getOutput(); 
								for(i in contactAddress)
								{
									if(contactAddress[i].getState()=="NY")
									{
										logDebug("State is NY");
										flagForLicense=1;
										break;
									}
								}
							}
						}
					}
				}
				else
				{
					logDebug("Inside else");
				}
			}
		
			//Generate license certificate
			if(flagForLicense==1 || (recordSubType!="Nursery Grower" && recordSubType!="Nursery Dealer" && recordSubType!="Ammonium Nitrate Fertilizer"))
			{
				//Run report for license
				//if(recordSubType == "Nursery Dealer" || recordSubType == "Nursery Grower" || recordSubType == "Farm Products Dealer")
					runLicReport("report",license,reportName,licenseID.getCustomID());
				
				
				//Renew license for each product in Agricultural Liming License
				/*if(recordSubType=="Agricultural Liming Material")
				{
					var testASIT = loadASITable("LIME BRAND",licenseID);  
					for(x in testASIT)
					{ 
						logDebug("License Num Values: " + testASIT[x]["License #"]); 
						if(testASIT[x]["License Status"] == "Active")
						{ 
							//runLicReport("brand",emailTemplateName,license,reportName,licenseID.getCustomID()); 
							logDebug("Report sent successfully"); 
							//aa.print("Report sent successfully"); 
						} 
						else
						{ 
							//aa.print("Status is Inactive"); 
							logDebug("Status is Inactive"); 
						} 
					}
				}*/
			}
	
			//Generate license certificate for every contact of type "facility location"
			if(recordSubType=="Ammonium Nitrate Fertilizer")
			{
				/*for(yy in capContactResult)
				{
					var peopleModel= capContactResult[yy].getPeople();
					if(peopleModel.getContactType()=="Facility Location")
					{ 
						seqNumber= peopleModel.getContactSeqNumber();
						logDebug("Sequence Number: " + seqNumber + " Contact type: " + peopleModel.getContactType());
						var capContactScriptModel= capContactResult[yy];
						var capContactModel= capContactScriptModel.getCapContactModel();
						var contactAddress=aa.address.getContactAddressListByCapContact(capContactModel);
						if(contactAddress.getSuccess())
						{
							contactAddress=contactAddress.getOutput();
							for(i in contactAddress)
							{
								if(contactAddress[i].getState()=="NY")
								{
									//logDebug("Generating certificate for ammonium facility location");
									//runLicReportForAmmonium("facility location",emailTemplateName,license,reportName,licenseID.getCustomID(),seqNumber);
									runLicReport("facility location",license,reportName,licenseID.getCustomID(),seqNumber);
								}
							}
						}
					}	
				}*/ 
			}
			
			//Generate license certificate for every contact of type "additional location"
			if(recordSubType=="Nursery Dealer" || recordSubType=="Nursery Grower")
			{
				/* for(yy in capContactResult)
				{
					var peopleModel= capContactResult[yy].getPeople();
					if(peopleModel.getContactType()=="Additional Location")
					{ 
						seqNumber= peopleModel.getContactSeqNumber();
						logDebug("Sequence Number: " + seqNumber + " Contact type: " + peopleModel.getContactType());
						var capContactScriptModel= capContactResult[yy];
						var capContactModel= capContactScriptModel.getCapContactModel();
						var contactAddress=aa.address.getContactAddressListByCapContact(capContactModel);
						if(contactAddress.getSuccess())
						{
							contactAddress=contactAddress.getOutput();
							for(i in contactAddress)
							{
								if(contactAddress[i].getState()=="NY")
								{
									runLicReport("additional location",license,reportName,licenseID.getCustomID(),seqNumber);
								}
							}
						}
					}
				} */ 
			}	
		}
		
		//Generate a consolidated report for all the set members
		logDebug("Generating set report");
		for(var x=0; x<1;x++)
		{
				var memberForSet=array.get(x);
				memberForSet =  memberForSet.toString();
				var ids=new Array();
				ids = memberForSet.split("-");
				licenseForSet = aa.cap.getCap(ids[0], ids[1], ids[2]);
				licenseForSet = licenseForSet.getOutput();
				itemCapForSet = licenseForSet.getCapID();
		}
		
		logDebug(licenseForSet + " " + itemCapForSet.getCustomID());
		runSetReport(emailTemplateForSet,reportNameForSet,setID4Process, itemCapForSet.getCustomID(),licenseForSet);
		
		//Update the set status and comments
		if(setID4Process)
		{
			var setUpdate= new capSet(setID4Process);
			setUpdate.status="Completed";
			setUpdate.comment="Successfully processed";
			setUpdate.update();
		
		}
	}	
}

//Generate report for each set member
function runLicReport(str,license,reportName,itemCap,cSeqNumber)
{
	logDebug("Inside runLicReport");
	var parameters=aa.util.newHashMap();
     //if(arguments.length==5)
    {
        parameters.put("ALT_ID", itemCap);
         parameters.put("SET_ID", "ALL");
        logDebug("Report parameters for license: " + parameters);
    }
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    //aa.print(report);
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
	logDebug("Permission for report: " + checkPermission.getOutput().booleanValue());
    //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
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
				if(str=="report")
				{
					//setEmailParameters(license,emailTemplate,reportFile);
				}
			}
        }       
    }
}

//Generate consolidated report for all set members and send an email with the report attached
function runSetReport(emailTemplateForSet,reportNameForSet,setID4Process,itemCap,license)
{
    logDebug("Inside runSetReport");
	var parameters=aa.util.newHashMap();
    
    parameters.put("ALT_ID", "ALL");
	parameters.put("SET_ID", setID4Process);    
    logDebug("Report parameters for license: " + parameters);
   
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    //aa.print(report);
    //report.setCapId(itemCap);
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
				setEmailParameters(license,emailTemplateForSet,reportFile,setID4Process);
			}
        }       
    }
}

//Generate email for sending out the consolidated report
function setEmailParameters(license, emailTemplateName,reportFile,setID)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    //var toEmailAddress = "aditi@gcomsoft.com";
	logDebug("To email address: " + toEmailAddress);

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
	
	//Set email parameters and send email notification
	if(toEmailAddress)
	{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
         
            sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
    }
    
}

/*function setEmailParameters(license, emailTemplateName,reportFile)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";
	var rFiles = new Array();
	rFiles.push(reportFile);
	
	var capId = license.getCapID();
	var capContactResult=aa.people.getCapContactByCapID(capId);
	if(capContactResult.getSuccess())
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
		if(toEmailAddress)
		{
			var params=aa.util.newHashtable();
            params.put("$$licenseType$$",license.getCapType().getAlias());
            params.put("$licAltID$$",capId.getCustomID());
            params.put("$$licenseTypeThirdLevel$$",recordSubType);
            sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
        }
    } 
}*/