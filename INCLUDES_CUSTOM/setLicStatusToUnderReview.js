function setLicStatusToUnderReview(renewalCapId, parentCapId)
{
	logDebug("Inside setLicStatusToUnderReview"); 
	var renewalOpenDate =aa.cap.getCap(renewalCapId).getOutput().getFileDate();
	var renewalDateString= renewalOpenDate.getMonth() + "/" + renewalOpenDate.getDayOfMonth() + "/" + renewalOpenDate.getYear();
	logDebug("Renewal Open Date: " + renewalDateString);
	
	var expDate;
	var expDateString;
	var flag=0;
	var b1ExpResult=aa.expiration.getLicensesByCapID(parentCapId);
	if(b1ExpResult.getSuccess())
	{
		logDebug("Success");
		b1ExpResult=b1ExpResult.getOutput();
		expDate=b1ExpResult.getExpDate();
		logDebug(expDate);
		expDateString= expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		logDebug("License Exp date: " + expDateString);
	}
	
	var rDate=new Date();
	rDate.setDate(renewalOpenDate.getDayOfMonth());
	rDate.setMonth(renewalOpenDate.getMonth());
	rDate.setFullYear(renewalOpenDate.getYear());
	//aa.print(date1.getMonth() + "/" + date1.getDate() + "/" + date1.getFullYear());
	
	var pDate=new Date();
	pDate.setDate(expDate.getDayOfMonth());
	pDate.setMonth(expDate.getMonth());
	pDate.setFullYear(expDate.getYear());
	
	var dateDifference = Math.round((rDate.getTime() - pDate.getTime())/(24*60*60*1000));
	logDebug("Date difference: " + dateDifference);
	if(dateDifference>30)
	{
		logDebug("Updating status");
		flag=1;
	}
	
	if(flag==1)
	{
		return true;
	}
	else
	{
		return false;
	}
}