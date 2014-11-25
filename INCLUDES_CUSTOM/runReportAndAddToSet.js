function runReportAndAddToSet(capId, inspStr, inspId)
{
	var reportName;
	var setID;
	var setType;
	var setDescription;
	var setResult;
	var generateReport = 0;
	var tDate=new Date();
	var dateString = (tDate.getMonth() + 1) + "/" + tDate.getDate() + "/" + tDate.getFullYear();
	//var custId = capId.getCustomID();
	
	logDebug("Inside runReportAndAddToSet ");
	
	if(inspStr.equalsIgnoreCase("Violation of Stop Sale"))
	{
		reportName = "Soil Plant Inoculant License";
		setID = "Violation of Stop Sale" + "_" + dateString;
		setType = "Violation of Stop Sale Letter";
	}
	else if(inspStr.equalsIgnoreCase("Violation of Quarantine"))
	{
		reportName = "Soil Plant Inoculant License";
		setID = "Violation of Quarantine Letter" + "_" + dateString;
		setType = "Violation of Quarantine Letter";
	}
	else if(inspStr.equalsIgnoreCase("Plum Pox"))
	{
		reportName = "Soil Plant Inoculant License";
		setID= "Plum Pox Compliance Agreement Interview" + "_" + dateString;
		setType = "Plum Pox Compliance Agreement Issued";
	}
	else if (inspStr.equalsIgnoreCase("Emerald Ash"))
	{
		reportName = "Soil Plant Inoculant License";
		setID = "Emerald Ash Borer Compliance Agreement Interview" + "_" + dateString;
		setType = "Emerald Ash Compliance Agreement Issued";
	}
	
	setDescription = setType;
	
	logDebug("Set ID: " + setID);
	
	setResult=aa.set.getSetByPK(setID);
	if(setResult.getSuccess())
	{
     	setResult=setResult.getOutput();
		var setMembers=aa.set.getCAPSetMembersByPK(setResult.getSetID());
		var array=new Array();
		array=setMembers.getOutput();
		var estID = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		logDebug("Establishment ID: " + estID);
		var checkEstExists=0;
		for(i=0;i<array.size();i++)
		{
			var setMember=array.get(i);
			setMember=setMember.toString();
			logDebug("Set member ID: " + setMember);
			if(setMember==estID)
			{
				logDebug("Record exists in set");
				checkEstExists=1;
				break;
			}
		}

		if(checkEstExists==0)
		{
			var addResult= aa.set.addCapSetMember((setResult.getSetID()),capId); 
			logDebug("Result for set with pending status: " + addResult.getSuccess());
			if(addResult.getSuccess())
			{
				generateReport = 1;
			}
		}
	}
	else
	{
		var result=createSet(setID,setType, setType, "Pending", "Processing");
		logDebug("createSet Result: " + result);
		if(result)
		{
    	   	logDebug("Set created");
     		setResult=aa.set.getSetByPK(setID);
     		if(setResult.getSuccess())
     		{
        		setResult=setResult.getOutput();
        		var addResult= aa.set.addCapSetMember((setResult.getSetID()),capId); 
        		logDebug("Result for 1st new set: " + addResult.getSuccess());
				if(addResult.getSuccess())
				{
					generateReport = 0;
				}
     		}
		}
	}
	
	/*if(generateReport == 1)
	{
		var parameters=aa.util.newHashMap();
		parameters.put("ALT_ID",capId.getCustomID());
		//parameters.put("b1.b1_alt_id",inspId);
						
		report=aa.reportManager.getReportInfoModelByName(reportName);
		report=report.getOutput();
		logDebug("Report: " + report);
		report.setCapId(capId.getCustomID());
		report.setModule("Licenses");
		report.setReportParameters(parameters);
		logDebug("Report parameters: "+ report.getReportParameters());
		var checkPermission=aa.reportManager.hasPermission(reportName,currentUserID);
				
		if(checkPermission.getOutput().booleanValue())
		{   
			logDebug(currentUserID + "has permission");
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
	}*/
	
	/*if(setResult)
	{
		var setUpdate= new capSet(setResult.getSetID());
		setUpdate.status="Completed";
		setUpdate.comment="Successfully processed";
		setUpdate.update();
	}*/
	
}