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
maxSeconds = 4.5 * 2400;         // number of seconds allowed for batch processing, usually < 5*60
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
var recordType = aa.env.getValue("recordType");		//App type
var recordSubType = aa.env.getValue("recordSubType");		//App sub type
var reportNameFor60 = aa.env.getValue("reportNameFor60");	//Report name for 1st renewal notice
var reportNameFor30 = aa.env.getValue("reportNameFor30");	//Report name for 2nd renewal notice
var emailTemplateFor60 = aa.env.getValue("emailTemplateFor60");	//Email template for 1st renewal notice
var emailTemplateFor30 = aa.env.getValue("emailTemplateFor30");	//Email template for 2nd renewal notice
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");	//Email template for consolidated report
var reportNameForSet60 = aa.env.getValue("reportNameForSet60");		//Report name for 1st renewal notice consolidated report
var reportNameForSet30 = aa.env.getValue("reportNameForSet30");		//Report name for 2nd renewal notice consolidated report
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
 emptyCm1.setCapStatus("About to Expire");
 var vCapList;
 var emptyGISArray = new Array();
 
 var tDate= new Date();
 var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
 
 var existingSet;
 var flagForRecordSubType;
 var setID1; 
 var setID2;
 
 logDebug("Record Sub Type: " + recordSubType);
 
 //Generate set IDs and description for renewal sets
 var recordSubTypeUpCase = recordSubType.toUpperCase();
 
 setID1=  recordSubTypeUpCase + "_" + dateString + "_" + "RENEWALNOTICE60DAYSPRIOR";
 
 setID2= recordSubTypeUpCase + "_" + dateString + "_" + "RENEWALNOTICE30DAYSPRIOR";
 logDebug("Set ID1: " + setID1);
 logDebug("Set ID2: " + setID2);
 var setDescription= recordSubType + " " + "-" + " " + "Renewal";
 logDebug("Description:" + setDescription);
 var setType=setDescription;
 var renewalSetFor60;
 var renewalSetFor30;
 var checkSetExistsFor60;
 var checkSetExistsFor30;
 
 //Check if renewal set for 60 days exists
 renewalSetFor60 = aa.set.getSetByPK(setID1); 
 if(renewalSetFor60.getSuccess())
 {
  renewalSetFor60 = renewalSetFor60.getOutput();
  checkSetExistsFor60 = "Y";
 }
 else
 {
  checkSetExistsFor60 = "N";
 }
 
 //Check if renewal set for 60 days exists
 renewalSetFor30 = aa.set.getSetByPK(setID2);
 if(renewalSetFor30.getSuccess())
 {
  renewalSetFor30 = renewalSetFor30.getOutput();
  checkSetExistsFor30 = "Y";
 }
 else
 {
  checkSetExistsFor30 = "N";
 }
 
 //var vCapListResult = aa.cap.getCapListByCollection(emptyCm1, null, null, null, null, null, emptyGISArray);
 //Get all records based on the type and sub type in the batch job parameters
 var vCapListResult = aa.cap.getCapIDListByCapModel(emptyCm1);
 
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
  var flagForLicense=0;
  var flagFor60=0;
  var flagFor30=0;
  var flagForFacilityLoc=0;
  var flagForAdditionalLoc=0;
  var flagForAdditionalLoc=0;
  var checkLicInExistingSetFor60 = 0;
  var checkLicInExistingSetFor30 = 0;
  
  var capId = aa.cap.getCapID(vCapList[thisCap].getCapID().getID1(),vCapList[thisCap].getCapID().getID2(),vCapList[thisCap].getCapID().getID3()).getOutput();
  logDebug("Cap ID: " + capId);
  var license= aa.cap.getCap(capId).getOutput();
  var licenseID = license.getCapID();
  
  var b1ExpResultRec=aa.expiration.getLicensesByCapID(capId);
  if(b1ExpResultRec.getSuccess())
  {
   b1ExpResult=b1ExpResultRec.getOutput();
   //Get expiration date
   var expDate = b1ExpResult.getExpDate();
   if(expDate)
   {
    var capContactResult=aa.people.getCapContactByCapID(capId);
    if(capContactResult.getSuccess())
    {
     capContactResult=capContactResult.getOutput();
    }
	
	//Check the business contact and ASI fields for Nursery Dealer, Grower and Ammonium Nitrate
    if(recordSubType=="Nursery Dealer" || recordSubType=="Nursery Grower" || recordSubType=="Ammonium Nitrate Fertilizer")
    {
     var asiInfo;
     if(recordSubType=="Ammonium Nitrate Fertilizer")
     {
      asiInfo="ammonium";
     }
     else if(recordSubType=="Nursery Dealer")
     {
      asiInfo=getAppSpecific("Does the Main Location deal in selling plants?", capId);
     }
     else if(recordSubType=="Nursery Grower")
     {
      asiInfo=getAppSpecific("Does the Main Location deal in Growing plants?", capId);
     }
     logDebug("ASI Info: " + asiInfo);
     if(asiInfo=="Yes" || asiInfo=="ammonium")
     {
      //Check if busniess contact has state as "NY"
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
      aa.print("Inside else");
     }
    } 
	
    var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
    aa.print("Expiration date Test" + b1ExpDate);
    var oneDay = 24*60*60*1000;
    var addDays = new Date(Date.parse(b1ExpDate));
    aa.print("Added Days" + addDays);
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
    var todayDate = new Date(Date.parse(today));
    //aa.print("Current Date" + today);
	
	//Calculate the number of days before license expires
    var condition = Math.round(Math.abs((addDays.getTime() - todayDate.getTime())/(oneDay)));
    logDebug("Condition for Time" + condition);
    var b1Status = b1ExpResult.getExpStatus();
    aa.print("Exp Status" + b1Status);
    
    if(b1Status=="About to Expire")
    {
     if(condition == 60)		//60 days before expiration
     {
      if(checkSetExistsFor60 == "Y")	//Check if record exists in the renewalSetFor60
      {
       var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor60.getSetID());
       var array=new Array();
       array=setMembers.getOutput();
       var licID=capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
       
       for(i=0;i<array.size();i++)
       {
        var setMember=array.get(i);
        setMember=setMember.toString();
        if(setMember== licID)
        {
         logDebug("Record exists in set");
         checkLicInExistingSetFor60 = 1;
         break;
        }
       }
      }
      if(checkLicInExistingSetFor60 == 0)
      {
       flagFor60=1;
      }
     }
     
     else if(condition == 30)		//30 days before expiration
     {
      if(checkSetExistsFor30 == "Y")	//Check if record exists in the renewalSetFor60
      {
       var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor30.getSetID());
       var array=new Array();
       array=setMembers.getOutput();
       var licID=capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
       
       for(i=0;i<array.size();i++)
       {
        var setMember=array.get(i);
        setMember=setMember.toString();
        if(setMember== licID)
        {
         logDebug("Record exists in set");
         checkLicInExistingSetFor30 = 1;
         break;
        }
       }
      }
      logDebug("Flag for 30: " + checkLicInExistingSetFor30);
      if(checkLicInExistingSetFor30 == 0)
      {
       logDebug("Inside if");
       flagFor30=1;
      }
      logDebug("flagFor30: " + flagFor30);
     }
     
	
	if(flagFor60==1 || flagFor30==1)
     {
     //Renew license for each product in Agricultural Liming License
      /*if(recordSubType=="Agricultural Liming Material")
      {
       var testASIT = loadASITable("LIME BRAND",capId); 
       //aa.print("Loading of ASIT successful"); 
       for(x in testASIT)
       { 
        logDebug("License Num Values: " + testASIT[x]["License #"]); 
        if(testASIT[x]["License Status"] == "Active")
        { 
         //runRenewalReport("brand", emailTemplateName, license, reportName,capId.getCustomID()); 
         logDebug("Report sent successfully"); 
        } 
        else
        {  
         logDebug("Status is Inactive"); 
        } 
       }
      }*/
     
      //Generate license certificate for every contact of type "facility location"
      if(recordSubType=="Ammonium Nitrate Fertilizer")
      {
       for(yy in capContactResult)
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
		 //Check if the facility location address has state as "NY"
		 for(i in contactAddress)
          {
           if(contactAddress[i].getState()=="NY")
           {
            logDebug("Generate report for facility location");
            flagForFacilityLoc = 1;
            if(flagFor60 == 1)	//Generate 1st renewal notice for the facility location
            {
             runRenewalReportWithSetID("facility location",emailTemplateFor60,license, reportNameFor60,capId,b1ExpDate,60)
            }
            if(flagFor30 == 1)	//Generate 2nd renewal notice for the facility location
            {
             runRenewalReportWithSetID("facility location",emailTemplateFor30,license, reportNameFor30,capId,b1ExpDate,30)
            }
            //runRenewalReport("facility location",emailTemplateName,license,reportName,capId.getCustomID(),seqNumber);
           }
          }
         }
        }
       } 
      }
    
      //Generate license certificate for every contact of type "additional location"
      if(recordSubType=="Nursery Dealer" || recordSubType=="Nursery Grower")
      {
       for(yy in capContactResult)
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
		  //Check if the additional location address has state as "NY"
          for(i in contactAddress)
          {
           if(contactAddress[i].getState()=="NY")
           {
            flagForAdditionalLoc = 1;
            if(flagFor60 == 1)
            {
             runRenewalReportWithSetID("additional location",emailTemplateFor60,license, reportNameFor60,capId,b1ExpDate,60);		//Generate 1st renewal notice for the additional location
            }
            if(flagFor30 == 1)
            {
             runRenewalReportWithSetID("additional location",emailTemplateFor30,license, reportNameFor30,capId,b1ExpDate,30);		//Generate 1st renewal notice for the additional location
            }
            //runRenewalReport("additional location", emailTemplateName, license, reportName,capId.getCustomID(),seqNumber);
           }
          }
         }
        }
       } 
      }
    
      if(flagForLicense==1 || (recordSubType!="Nursery Dealer" && recordSubType!="Nursery Grower"  && recordSubType!="Ammonium Nitrate Fertilizer") || flagForFacilityLoc == 1 || flagForAdditionalLoc == 1)
      {
       if(flagFor60==1)
       {
        //renewalSetFor60 = aa.set.getSetByPK(setID1); 
        if(checkSetExistsFor60 == "Y")		//Change set status and comment if set exists
        {
         var updateSetFor60= new capSet(renewalSetFor60.getSetID());
         updateSetFor60.status="Pending";
         updateSetFor60.comment="Processing";
         updateSetFor60.update();
        }
        else		//Create a new set for license records that expire 60 days from today
        {
         var createSetResult1= createSetForBatch(setID1,setDescription, setType, "Pending", "Processing", currentUserID);
         logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
         renewalSetFor60 = aa.set.getSetByPK(setID1); 
         if(renewalSetFor60.getSuccess())
         {
          renewalSetFor60 = renewalSetFor60.getOutput();
         }
        }
        
		//Add license record to set  (only if the record does not already exist in the set)
        var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
        logDebug("Add set result: " + addResult.getSuccess());
       } 
       if(flagFor30==1)
       {
        if(checkSetExistsFor30 == "Y")		//Change set status and comment if set exists
        {
         var updateSetFor30= new capSet(renewalSetFor30.getSetID());
         updateSetFor30.status="Pending";
         updateSetFor30.comment="Processing";
         updateSetFor30.update();
        }
        else		//Create a new set for license records that expire 30 days from today
        {
         var createSetResult2= createSetForBatch(setID2,setDescription, setType, "Pending", "Processing", currentUserID);
         logDebug("Create Set Result for " + setID2 + ":  " + createSetResult2);
         renewalSetFor30 = aa.set.getSetByPK(setID2);
         if(renewalSetFor30.getSuccess())
         {
          renewalSetFor30 = renewalSetFor30.getOutput();
         }
        } 
        
        //Add license record to set  (only if the record does not already exist in the set)
		var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
        logDebug("Add set result: " + addResult.getSuccess());
       }
       if(flagForLicense==1 || (recordSubType!="Nursery Dealer" && recordSubType!="Nursery Grower"  && recordSubType!="Ammonium Nitrate Fertilizer"))
       {
        //Generate report for 1st renewal notice
        if(flagFor60 == 1)
        {
         if(recordSubType == "Nursery Dealer" || recordSubType == "Nursery Grower")
         {
          runRenewalReportWithSetID("report",emailTemplateFor60,license, reportNameFor60,capId,b1ExpDate,60);
         }
         else
         {
          runRenewalReportWithSetID("report",emailTemplateFor60,license, reportNameFor60,capId,b1ExpDate,60);
         }
         //runSetReport("report",emailTemplateForSet, license, reportNameForSet,capId.getCustomID(),b1ExpDate,60, setID1);
        }
        
		//Generate report for 2nd renewal notice
		if(flagFor30 == 1)
        {
         if(recordSubType == "Nursery Dealer" || recordSubType == "Nursery Grower")
         {
          runRenewalReportWithSetID("report",emailTemplateFor30,license, reportNameFor30,capId,b1ExpDate,30);
         }
         else
         {
          runRenewalReportWithSetID("report",emailTemplateFor30,license, reportNameFor30,capId,b1ExpDate,30);
         }
        }
        
       }
      }
     }
    }
   }
  }
 }
	
	var renSet60 = aa.set.getSetByPK(setID1);
	var renSet30 = aa.set.getSetByPK(setID2);
	
	//Generate consolidated report for set with records that expire 60 days from today

	if(renSet60.getSuccess())
	{
		var setMembers=aa.set.getCAPSetMembersByPK(setID1);
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
			runSetReport(emailTemplateForSet, license, reportNameForSet60, licenseID.getCustomID(), setID1);
		}
	}
 
 
	//Generate consolidated report for set with records that expire 30 days from today
	if(renSet30)	
	{
		var setMembersForLate=aa.set.getCAPSetMembersByPK(setID2);
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
			runSetReport(emailTemplateForSet, license, reportNameForSet30, licenseID.getCustomID(), setID2);  
		}
	} 
 
 
 
 //logDebug("Set Result" + renSet60.getSuccess() + "Set ID for test" + renewalSetFor60.getSetID());
 
//Update the set status and comments
 if(renSet60.getSuccess())
 {
  
  renSet60 = renSet60.getOutput();
  
  var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
  setUpdateFor60.status="Completed";
  setUpdateFor60.comment="Successfully processed";
  setUpdateFor60.update();
 }
 
 if(renSet30.getSuccess())
 {
  renSet30 = renSet30.getOutput();
  var setUpdateFor30= new capSet(renewalSetFor30.getSetID());
  setUpdateFor30.status="Completed";
  setUpdateFor30.comment="Successfully processed";
  setUpdateFor30.update();
 }
}

//Generate report for each set member
function runRenewalReportWithSetID(str,emailTemplateName,license,reportName,capID,expDate,noOfDays)
{
     var parameters=aa.util.newHashMap();
  var reportFile;
  var custID = capID.getCustomID();
    {
        parameters.put("ALT_ID", custID);
  parameters.put("SET_ID", "ALL");
    }
   
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    if(report != null)
 {
  report.setCapId(custID);
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
     if(str=="report")
     {
      setEmailParameters(license,emailTemplateName,reportFile,expDate,noOfDays);
     }
    }
   }       
  } 
 }
}

//Generate email for sending out the 1st or 2nd renewal notice for each set member
function setEmailParameters(license, emailTemplateName,reportFile, expDate, noOfDays)
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


//Generate consolidated report for all set members and send an email with the report attached
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
  
  if(toEmailAddressForSetReport)
  {
   var params=aa.util.newHashtable();
   params.put("$$setID$$", setID);
   params.put("$$CURRENTDATE$$",currentDateString);
   params.put("$$setName$$", setTitle);
   sendNotification("noreply@accela.com",toEmailAddressForSetReport,"",emailTemplateName,params,rFiles,capId);
  }
}
