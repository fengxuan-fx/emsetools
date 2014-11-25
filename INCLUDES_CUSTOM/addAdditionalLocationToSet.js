function addAdditionalLocationToSet(recordType,parentID)
{
	logDebug("Inside addAdditionalLocationToSet");
	var capContactResult=aa.people.getCapContactByCapID(parentID);
	if(capContactResult.getSuccess())
	{
		logDebug("Success");
		capContactResult=capContactResult.getOutput();
		for(yy in capContactResult)
		{
			var peopleModel= capContactResult[yy].getPeople();
			if(peopleModel.getContactType()=="Additional Location")
			{
				seqNumber= peopleModel.getContactSeqNumber();;
				logDebug("Sequence Number: " + seqNumber);
			}
		}
	}
}