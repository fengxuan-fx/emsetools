function addLicenseToSet(recordType, parentID,typeOfSet)
{
   //var tDate=sysDateMMDDYYYY;
   var flag;
   var setIDForCompleted;
   var existingSet;
   var id;

   var date =  new Date();
   var dateString = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
   
   for(var i=0;;i++)
   {
		if(recordType=="Establishment" && arguments.length==2)
		{
			id = recordType + "_" + "Inspection" + "_" + dateString + "_" + (i+1); 
		}
		else if(recordType=="Establishment" && arguments.length==3)
		{
			if(typeOfSet=="Quarantine")
			{
				id="Violation of Quarantine Letter" + "_" + dateString + "_" + (i+1);
			}
			if(typeOfSet=="Stop Sale")
			{
				id="Violation of Stop Sale Letter" + "_" + dateString + "_" + (i+1);
			}
		}
		else
		{
			id = recordType + "_" + dateString + "_" + (i+1);
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
	if(recordType=="Establishment" && arguments.length==2)
	{
		setDescription=recordType + " " + "-" + " " + "Inspection";
	}
	else if(recordType=="Establishment" && arguments.length==3)
	{
		if(typeOfSet=="Quarantine")
		{
			setDescription="Violation of Quarantine Letter";
		}
		else
		{
			setDescription="Violation of Stop Sale Letter";
		}
	}
	else
	{
		setDescription= recordType + " " + "-" + " " + "License";
	}
	
	
	var setType= setDescription;
	logDebug("Set type: " + setType);
	
    if (flag=="P")
    {
   	//aa.print("Inside if");  
        var custID=parentID.getCustomID();
		var capID=aa.cap.getCapID(custID).getOutput();
		var set=aa.set.getSetByPK(existingSet.getSetID());
		set=set.getOutput();
		var addResult;
		var checkEstExists=0;
		if(recordType=="Establishment")
		{
			var setMembers=aa.set.getCAPSetMembersByPK(set.getSetID());
			var array=new Array();
			array=setMembers.getOutput();
			var estID=parentID.getID1() + "-" + parentID.getID2() + "-" + parentID.getID3();
			for(i=0;i<array.size();i++)
			{
				var setMember=array.get(i);
				setMember=setMember.toString();
				if(setMember==estID)
				{
					logDebug("Record exists in set");
					checkEstExists=1;
					break;
				}
			}
		}
		
		if(recordType!="Establishment" || checkEstExists==0)
		{
			addResult= aa.set.addCapSetMember((set.getSetID()),capID); 
			logDebug("Result for set with pending status: " + addResult.getSuccess());
		}
		
    }
    else if(flag=="N" && !setIDForCompleted)
    {
		logDebug("Create new set");
		var result=createSet(id,setDescription, setType, "Pending", "Processing");
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
		if(recordType=="Establishment" && arguments.length==2)
		{
			tempStr=recordType + "_" + "Inspection" + "_" + dateString + "_";
		}
		else if(recordType=="Establishment" && arguments.length==3)
		{
			if(typeOfSet=="Quarantine")
			{
				tempStr="Violation of Quarantine Letter" + "_" + dateString + "_";
			}
			else
			{
				tempStr="Violation of Stop Sale Letter" + "_" + dateString + "_";
			}
		}
		else
		{
			tempStr=recordType + "_" + dateString + "_";
		}
     	var setNumber=setIDForCompleted.substr(tempStr.length,setIDForCompleted.length());
     	setNumber= parseInt(setNumber);
     	setNumber=setNumber + 1;
		if(recordType=="Establishment" && arguments.length==2)
		{
			newSetId= recordType + "_" + "Inspection" + "_" + dateString + "_" + setNumber;
		}
		else if(recordType=="Establishment" && arguments.length==3)
		{
			if(typeOfSet=="Quarantine")
			{
				newSetId= "Violation of Quarantine Letter" + "_" + dateString + "_" + setNumber;
			}
			else
			{
				newSetId= "Violation of Stop Sale Letter" + "_" + dateString + "_" + setNumber;
			}
		}
		else
		{
			newSetId= recordType + "_" + dateString + "_" + setNumber;
		}
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


 /* function updateSetStatus(setName){
 var setTest = new capSet(setName);
 setTest.status = "Completed";  // update the set header status
 setTest.comment = "Successfully processed";   // changed the set comment
setTest.statusComment = "blah"; // change the set status comment
setTest.update();  // commit changes to the set
 }*/