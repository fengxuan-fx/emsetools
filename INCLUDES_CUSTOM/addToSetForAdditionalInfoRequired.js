function addToSetForAdditionalInfoRequired(recordType, capID)
{
	logDebug("Inside addToSetForAdditionalInfoRequired");
	var id;
	var flag;
	var existingSet;
	var setIDForCompleted;
	var str="Additional Info Required";
	var tDate= new Date();
	var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	
	for(var i=0;;i++)
	{
		id= str + " - " + recordType + "_" + dateString + "_" + (i+1);
		logDebug("Set ID: " + id);
		var setResult=aa.set.getSetByPK(id);
		if(setResult.getSuccess())
		{
     		setResult=setResult.getOutput();
     		logDebug("Set Comment: " + setResult.getSetComment());
     		if(setResult.getSetComment()=="Processing") //Set exists, status "Pending"
     		{
         		flag="P";
         		existingSet=setResult;
         		break;
     		}
     		else if(setResult.getSetComment()=="Successfully processed") //Set exists, status "Completed"
     		{
        		setIDForCompleted=setResult.getSetID();
     		}
		}
		else  //set does not exist
		{
       		flag="N";
       		break;
		}  
	}
	
	var setDescription;
	setDescription = str + " - " + recordType;
	
	if(flag=="P")
	{
		var custID= capID.getCustomID();
		var cID=aa.cap.getCapID(custID).getOutput();
		var set=aa.set.getSetByPK(existingSet.getSetID());
		set=set.getOutput();
		var addResult;
		var checkEstExists=0;
		
		var setMembers=aa.set.getCAPSetMembersByPK(set.getSetID());
		var array=new Array();
		array=setMembers.getOutput();
		var appID=capID.getID1() + "-" + capID.getID2() + "-" + capID.getID3();
		for(i=0;i<array.size();i++)
		{
			var setMember=array.get(i);
			setMember=setMember.toString();
			if(setMember==appID)
			{
				logDebug("Record exists in set");
				checkEstExists=1;
				break;
			}
		}
		
		if(checkEstExists==0)
		{
			addResult= aa.set.addCapSetMember((set.getSetID()),cID); 
			logDebug("Result for set with pending status: " + addResult.getSuccess());
		}
	}
	else if(flag=="N" && !setIDForCompleted)
	{
		logDebug("Create new set");
		var result=createSet(id,setDescription, setDescription, "Pending", "Processing");
		logDebug("createSet Result: " + result);
		if(result)
		{
    	   	logDebug("Set created");
     		var setResult=aa.set.getSetByPK(id);
     		if(setResult.getSuccess())
     		{
        		setResult=setResult.getOutput();
                var custID=capID.getCustomID();
        		var cID=aa.cap.getCapID(custID).getOutput();
        		var addResult= aa.set.addCapSetMember((setResult.getSetID()),cID); 
        		logDebug("Result for 1st new set: " + addResult.getSuccess());
			}
		}
	}
	else if(setIDForCompleted)
	{
		var tempStr;
		var newSetId;
		
		tempStr = str + " - " + recordType + "_" + dateString + "_" ;
		var setNumber=setIDForCompleted.substr(tempStr.length,setIDForCompleted.length());
     	setNumber= parseInt(setNumber);
     	setNumber=setNumber + 1;
		
		newSetId = str + " - " + recordType + "_" + dateString + "_" + setNumber;
		
		logDebug("New Set ID: " + newSetId);
     	var newSetResult=createSet(newSetId,setDescription, setDescription, "Pending", "Processing");
     	if(newSetResult)
     	{
         	var getNewSetResult=aa.set.getSetByPK(newSetId);
         	if(getNewSetResult.getSuccess())
         	{
             	getNewSetResult=getNewSetResult.getOutput();
                var customID=capID.getCustomID();
             	var cID=aa.cap.getCapID(customID).getOutput();
             	var addToNewSetResult= aa.set.addCapSetMember((getNewSetResult.getSetID()),cID); 
             	logDebug("Result for new set: " + addToNewSetResult.getSuccess());
         	}
     	}
	}
}