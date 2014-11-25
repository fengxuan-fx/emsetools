/*------------------------------------------------------------------------------------------------------/
	| Program: SERVICE_REQUEST_FINAL_NOTIFICATION.js  Trigger: Batch
	| Client:
	|
	| Version 1.0 - Base Version. 10/14/2014
	|
	/------------------------------------------------------------------------------------------------------*/
	/*------------------------------------------------------------------------------------------------------/
	|
	| START: USER CONFIGURABLE PARAMETERS
	|
	/------------------------------------------------------------------------------------------------------*/


	emailText = "";
	message = "";
	br = "<br>";
	debug = "";
	/*------------------------------------------------------------------------------------------------------/
	| BEGIN Includes
	/------------------------------------------------------------------------------------------------------*/
	SCRIPT_VERSION = 2.0

	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	eval(getScriptText("INCLUDES_BATCH"));
	eval(getScriptText("INCLUDES_CUSTOM"));


	function getScriptText(vScriptName){
		vScriptName = vScriptName.toUpperCase();
		var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
		var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";
	}

	/*------------------------------------------------------------------------------------------------------/
	|
	| END: USER CONFIGURABLE PARAMETERS
	|
	/------------------------------------------------------------------------------------------------------*/

	var showDebug = "3";	//debug level

	sysDate = aa.date.getCurrentDate();
	batchJobResult = aa.batchJob.getJobID()
	batchJobName = "" + aa.env.getValue("BatchJobName");
	wfObjArray = null;

	batchJobID = 0;
	if (batchJobResult.getSuccess())
	  {
	  batchJobID = batchJobResult.getOutput();
	  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
	  }
	else
	  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

	/*----------------------------------------------------------------------------------------------------/
	|
	| Start: BATCH PARAMETERS
	|
	/----------------------------------------------------------------------------------------------------*/

	var expStatus = getParam("expStatus");
	var appGroup = getParam("appGroup");							//   app Group to process {ServiceRequest}
	var appTypeType = getParam("appTypeType");	
	var appSubType = getParam("appSubType");	
	var appCategory = getParam("appCategory");	
	
	var emailTemplate = getParam("emailTemplate");
	var sendEmailToContactTypes = getParam("sendEmailToContactTypes");      // send out emails?

	var skipAppStatusArray = "";	//   Skip records with one of these application statuses
	var setPrefix = "SERVICEREQUEST_CLOSE";
	var maxSeconds = 300;


	if(expStatus.equals("Complete-Fixed")){
	    var newAppStatus = "Closed-Fixed";				//   update the CAP to this status 
	}else{
	    var newAppStatus = "Closed-No Violation";       // expStatus = "Complete-No Violation";
	}
	
	/*----------------------------------------------------------------------------------------------------/
	|
	| End: BATCH PARAMETERS
	|
	/----------------------------------------------------------------------------------------------------*/
	
	var startDate = new Date();
	var timeExpired = false;
	var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
	logDebug(" MailFrom: " + mailFrom);

	var startTime = startDate.getTime();			// Start timer
	var systemUserObj = aa.person.getUser("ADMIN").getOutput();

	if (appGroup=="")
		appGroup="*";
	if (appTypeType=="")
		appTypeType="*";
	if (appSubType=="")
		appSubType="*";
	if (appCategory=="")
		appCategory="*";
	var appType = appGroup+"/"+appTypeType+"/"+appSubType+"/"+appCategory;

	/*------------------------------------------------------------------------------------------------------/
	| <===========Main=Loop================>
	/-----------------------------------------------------------------------------------------------------*/

	logDebug("Start of Job");

	if (!timeExpired) mainProcess();

	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

	/*------------------------------------------------------------------------------------------------------/
	| <===========END=Main=Loop================>
	/-----------------------------------------------------------------------------------------------------*/


function mainProcess()
{
	var capCount = 0;

	// new a CapScriptModel 
	var scriptModel = aa.cap.newCapScriptModel().getOutput();
	// get a new CapModel
	var capModel = scriptModel.getCapModel();
	capModel.setCapStatus(expStatus);
	
	// Create a cap model for search   
	var searchCapModel = aa.cap.getCapModel().getOutput();
	// Set cap model for search. Set search criteria for record type DCA/*/*/*
	var searchCapModelType = searchCapModel.getCapType();
	searchCapModelType.setGroup(appGroup);
	searchCapModelType.setType(appTypeType);
	searchCapModelType.setSubType(appSubType);
	searchCapModelType.setCategory(appCategory);
	searchCapModel.setCapType(searchCapModelType);
	searchAddressModel = searchCapModel.getAddressModel();
	
	var toDate = aa.date.getCurrentDate();
	var fromDate = aa.date.parseDate("01/01/" + 1970); 
	gisObject = new com.accela.aa.xml.model.gis.GISObjects;
	qf = new com.accela.aa.util.QueryFormat;
	
	//get all cap with one status
	var capResult = aa.cap.getCapListByCollection(capModel,searchAddressModel,"",fromDate,toDate,qf,gisObject);

	if (capResult.getSuccess())
	{
		myCap = capResult.getOutput();
		logDebug("Processing " + myCap.length + " Service Request Records");
	}
    else
	{  logDebug("ERROR: Getting Service Request, reason is: " + capResult.getErrorType() + ":" + capResult.getErrorMessage()) ; return false }

	for (thisCap in myCap)  
	{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
			{
			logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break;
			}

		b1Cap = myCap[thisCap];

		capId = aa.cap.getCapID(b1Cap.getCapID().getID1(),b1Cap.getCapID().getID2(),b1Cap.getCapID().getID3()).getOutput();

		if (!capId)
			{
			logDebug("Could not get a Cap ID for " + b1Cap.getCapID().getID1() + "-" + b1Cap.getCapID().getID2() + "-" + b1Cap.getCapID().getID3());
			continue;
		}

		altId = capId.getCustomID();
	
	   // get address
		var capAddressResult = aa.address.getAddressByCapId(capId);
		var addr = null;
		if (capAddressResult.getSuccess()){
			Address = capAddressResult.getOutput();
			for (yy in Address){
				if ("Y"==Address[yy].getPrimaryFlag()){
					addr = Address[yy];
					//logDebug("Target CAP has primary address");
					break;
				}
			}
			if(addr == null){
				addr = Address[0];
			}
		}
		else{
			logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
		}
		
		if(addr != null){
			var address = "";
			if("".equals(address)){
				address = addr.getHouseNumberStart() != null? " " + addr.getHouseNumberStart(): "";
				address += (addr.getStreetDirection() != null? " " + addr.getStreetDirection(): "");
				address += (addr.getStreetName() != null? " " + addr.getStreetName(): "");
				address += (addr.getStreetSuffix() != null? " " + addr.getStreetSuffix(): "");
				address += (addr.getUnitType() != null? " " + addr.getUnitType(): "");
				address += (addr.getUnitStart() != null? " " + addr.getUnitStart(): "");		
				address += (addr.getCity() != null? " " + addr.getCity(): "");
				address += (addr.getState() != null? " " + addr.getState(): "");
				address += (addr.getZip() != null? " " + addr.getZip(): "");
			}
        }
		var capResult = aa.cap.getCap(capId).getOutput();
		var description = capResult.getCapModel().getCapWorkDesModel().getDescription();
		
		// update workflow task status
		var workflowResult = aa.workflow.getTasks(capId);
		if (workflowResult.getSuccess())
			var wfObj = workflowResult.getOutput();
		else
			{ 
			logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); 
			return false; 
			}
		
		for (i in wfObj)
			{
				fTask = wfObj[i];
				var taskName = fTask.getTaskDescription();
				if(taskName.equals("Final Notification")){
				   fTask.setDisposition("Send Email");
				   aa.workflow.editTask(fTask);
				   var newStatus = fTask.getDisposition();
				   logMessage(" Updated workflow task " + taskName + " with status: " + newStatus);
				   logDebug(" Updated workflow task " + taskName + " with status: " + newStatus);
				   break;
				}
			}

		// send email	
		if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) 
		{
			var conTypeArray = sendEmailToContactTypes.split(",");
			var	conArray = getContactArrayCustom(capId);

			for (thisCon in conArray)
				{
				conEmail = null;
				b3Contact = conArray[thisCon];
				
				if (exists(b3Contact["contactType"],conTypeArray))
					conEmail = b3Contact["email"];
					
				aa.print("Contact Email: " + conEmail);
				
				if (conEmail) {
					emailParameters = aa.util.newHashtable();
					addParameter(emailParameters,"$$email$$",conEmail);
					addParameter(emailParameters,"$$capID$$",altId);
					addParameter(emailParameters,"$$capStatus$$",newAppStatus);
					addParameter(emailParameters,"$$capAddr$$",address);
					addParameter(emailParameters,"$$capWrkDesc$$",description);

					var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());

					var fileNames = [];

					aa.document.sendEmailAndSaveAsDocument(mailFrom,conEmail,"" , emailTemplate, emailParameters, capId4Email, fileNames);	
                    					
					logDebug(altId + ": Sent Email template " + emailTemplate + " to " + b3Contact["contactType"] + " : " + conEmail);
				}
			}
		}
		
		// update CAP status
		if (newAppStatus.length > 0 && newAppStatus != null && newAppStatus != "null")
		{
			updateAppStatus(newAppStatus, "", capId);
		}
		
		capCount++;
	}
	
	function getContactArrayCustom(capId)
	   {
	   // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	   // optional capid
	   var thisCap = capId;

	   var cArray = new Array();

	   var capContactResult = aa.people.getCapContactByCapID(thisCap);
	   if (capContactResult.getSuccess())
		  {
		  var capContactArray = capContactResult.getOutput();
		  for (yy in capContactArray)
			 {
			 var aArray = new Array();
			 
			 aArray["lastName"] = capContactArray[yy].getPeople().lastName;
			 aArray["firstName"] = capContactArray[yy].getPeople().firstName;
			 aArray["businessName"] = capContactArray[yy].getPeople().businessName;
			 aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
			 aArray["contactType"] = capContactArray[yy].getPeople().contactType;
			 aArray["relation"] = capContactArray[yy].getPeople().relation;
			 aArray["phone1"] = capContactArray[yy].getPeople().phone1;
			 aArray["phone2"] = capContactArray[yy].getPeople().phone2;
			 aArray["phone2countrycode"] = capContactArray[yy].getCapContactModel().getPeople().getPhone2CountryCode();
			 aArray["email"] = capContactArray[yy].getCapContactModel().getPeople().getEmail();
			 aArray["preferredChannel"] = capContactArray[yy].getCapContactModel().getPreferredChannel();


			 var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
					   for (xx1 in pa)
							aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;
			 cArray.push(aArray);
			 }
		  } 
	      return cArray;
	   }	
	
    logDebug("Total Records processed: " + capCount);	
	
}
	
	