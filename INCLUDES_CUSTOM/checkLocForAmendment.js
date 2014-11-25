function checkLocForAmendment(capId,pid,type)
{
	logDebug("Inside checkLocForAmendment");
	logDebug("Cap ID: " + capId.getCustomID());
	logDebug("Parent ID: " + pid);
	logDebug("Type: " + type);
	logDebug("Parent License Number: " + getParentLicenseCapID(capId));
	
	var tDate=sysDateMMDDYYYY;
	var recordSubType;
	var reportName="License Certificate";
	if(type=="Dealer")
	{
		recordSubType="Nursery Dealer";
	}
	else if(type=="Grower")
	{
		recordSubType="Nursery Grower";
	}
	
	var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
	setScriptSearch.setSetID(recordSubType + "_" + tDate);
	var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);
	if (setHeaderList.getSuccess())  //Set Exists
	{
		var setList = setHeaderList.getOutput();
		setID4Process = String(setList.get(0).getSetID());
		logDebug("Set exists");
	}
	else    //Create new set
	{
		var id=recordSubType + " " + "Amendment" + "_" + tDate;	
		var createSetResult=createSet(id,"Nursery Dealer - Add Location", "Nursery Dealer - License", "Pending", "Processing");
		logDebug("Create new set result: " +  createSetResult);
		setID4Process=id;
	}
	
	var contactArrayForLicense=aa.people.getCapContactByCapID(pid);
	if(contactArrayForLicense.getSuccess())
	{
		contactArrayForLicense=contactArrayForLicense.getOutput();
	}
	
	var contactArrayForAmendment=aa.people.getCapContactByCapID(capId);
	if(contactArrayForAmendment.getSuccess())
	{
		contactArrayForAmendment=contactArrayForAmendment.getOutput();
	}
	
	var licCount=0;
	var amCount=0;
	for(licCon in contactArrayForLicense)
	{
		var conForLicense=contactArrayForLicense[licCon].getPeople();
		if(conForLicense.getContactType()=="Additional Location")
		{
			licCount++;
		}
	}
	
	for(amendmentCon in contactArrayForAmendment)
	{
		var conForAmendment=contactArrayForAmendment[amendmentCon].getPeople();
		if(conForAmendment.getContactType()=="Additional Location")
		{
			amCount++;
		}
	}
	
	var addToSet=0;
	
	if(licCount==0 && amCount>0)
	{
		addToSet=1;
		//Generate license for every additional location contact in the amendment
		for(amendmentCon in contactArrayForAmendment)
		{
			var conForAmendment=contactArrayForAmendment[amendmentCon].getPeople();
			if(conForAmendment.getContactType()=="Additional Location")
			{
				//Run report
				//runReport(capId,"Approved",aSeqNumber,reportName);
			}
		}
	}
	else if(licCount>0 && amCount>0)
	{
		for(amendmentCon in contactArrayForAmendment)
		{
			var conForAmendment=contactArrayForAmendment[amendmentCon].getPeople();
			var check=0;
			if(conForAmendment.getContactType()=="Additional Location")
			{
				var aSeqNumber=conForAmendment.getContactSeqNumber();
				logDebug("Seq number for amendment: " + aSeqNumber);
				for(licCon in contactArrayForLicense)
				{
					var conForLicense=contactArrayForLicense[licCon].getPeople();
					if(conForLicense.getContactType()=="Additional Location")
					{
						var lSeqNumber=conForLicense.getContactSeqNumber();
						logDebug("Seq number for license: " + lSeqNumber);
						if(aSeqNumber==lSeqNumber)
						{
							check=1;
							logDebug("Breaking");
							break;
						}
					}
				}
				logDebug("After break");
				if(check==0)
				{
					addToSet=1;
					//Run report for this contact
					runReportForAmendment(capId,"Approved",aSeqNumber,reportName);
				}
			}
		}
	}
	
	
	/*for(amendmentCon in contactArrayForAmendment)
	{
		var conForAmendment=contactArrayForAmendment[amendmentCon].getPeople();
		if(conForAmendment.getContactType()=="Additional Location")
		{	
			var aSeqNumber=conForAmendment.getContactSeqNumber();
			logDebug("Seq number for amendment: " + aSeqNumber);
			for(licCon in contactArrayForLicense)
			{
				var conForLicense=contactArrayForLicense[licCon].getPeople();
				if(conForLicense.getContactType()=="Additional Location")
				{
					var lSeqNumber=conForLicense.getContactSeqNumber();
					logDebug("Seq number for license: " + lSeqNumber);
					if(aSeqNumber!=lSeqNumber)
					{
						addToSet=1;
						var parameters=aa.util.newHashMap();
						parameters.put("capID", capId.getCustomID());
						parameters.put("Status", "Active");
						report=aa.reportManager.getReportInfoModelByName(reportName);
						report=report.getOutput();
   
						report.setCapId(capId.getCustomID());
						report.setModule("Licenses");
						report.setReportParameters(parameters); 
						
						logDebug("Report parameters: "+ report.getReportParameters());
						var checkPermission=aa.reportManager.hasPermission("License Certificate","admin");
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
				}
			}
		}
	}*/
	
	if(addToSet==1)
	{
		var addResult= aa.set.addCapSetMember(setID4Process,capId);
		logDebug("Add set member: " + addResult.getSuccess());
	}
}
