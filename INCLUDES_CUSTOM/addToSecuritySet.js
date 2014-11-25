function addToSecuritySet(recordType, parentID,typeOfSet, str)
{
	var tDate = sysDateMMDDYYYY;
	var existingSet;
	var setIDForCompleted;
	var id;
	var flag;
	
	for(var i=0;;i++)
	{
		if(typeOfSet.equalsIgnoreCase("Bad Check Fee"))
		{
			id = typeOfSet + "_" + tDate + "_" + (i+1);
		}
		else
		{
			id = typeOfSet + "_" +  str + "_" + tDate + "_" + (i+1);
		}
		
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
		var setType;
		
		if(typeOfSet == "Bad Check Fee")
		{
			setDescription = typeOfSet;
			setType = typeOfSet
		}
		else
		{
			setDescription = recordType + str + " " + "-" + " " + typeOfSet;
			setType = recordType + " " + "-" + " " + typeOfSet;
		}
		
		 
		if (flag=="P")
		{
			var custID=parentID.getCustomID();
			var capID=aa.cap.getCapID(custID).getOutput();
			var set=aa.set.getSetByPK(existingSet.getSetID());
			set=set.getOutput();
			var addResult;
			var checkEstExists=0;
		
			var setMembers=aa.set.getCAPSetMembersByPK(set.getSetID());
			var array=new Array();
			array=setMembers.getOutput();
			var appID=parentID.getID1() + "-" + parentID.getID2() + "-" + parentID.getID3();
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
			addResult= aa.set.addCapSetMember((set.getSetID()),capID); 
			logDebug("Result for set with pending status: " + addResult.getSuccess());
		}	
	}
	 else if(flag=="N" && !setIDForCompleted)
    {
		logDebug("Create new set");
		var result=createSet(id,setDescription, setType , "Pending", "Processing");
		logDebug("createSet Result: " + result);
		if(result)
		{
    	   	logDebug("Set created");
     		var setResult=aa.set.getSetByPK(id);
     		if(setResult.getSuccess())
     		{
        		setResult=setResult.getOutput();
                var cID=parentID.getCustomID();
        		var capID=aa.cap.getCapID(cID).getOutput();
        		var addResult= aa.set.addCapSetMember((setResult.getSetID()),capID); 
        		logDebug("Result for 1st new set: " + addResult.getSuccess());

     		}
		}
    }
	else if(setIDForCompleted)
	{
		var tempStr;
		var newSetId;
		
		tempStr = typeOfSet + "_" + str + "_" +  tDate + "_" ;
		
		var setNumber=setIDForCompleted.substr(tempStr.length,setIDForCompleted.length());
     	setNumber= parseInt(setNumber);
     	setNumber=setNumber + 1;
		
		newSetId = typeOfSet + "_" + str + "_" + tDate + "_" + setNumber;
		
		logDebug("New Set ID: " + newSetId);
     	var newSetResult=createSet(newSetId,setDescription, setType, "Pending", "Processing");
     	if(newSetResult)
     	{
         	var getNewSetResult=aa.set.getSetByPK(newSetId);
         	if(getNewSetResult.getSuccess())
         	{
             		getNewSetResult=getNewSetResult.getOutput();
                    var customID=parentID.getCustomID();
             		var capID=aa.cap.getCapID(customID).getOutput();
             		var addToNewSetResult= aa.set.addCapSetMember((getNewSetResult.getSetID()),capID); 
             		logDebug("Result for new set: " + addToNewSetResult.getSuccess());
         	}
     	}
	}
}