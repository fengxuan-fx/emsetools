function calExpireDate(pcapId) {
    
	logDebug("Inside calExpireDate");
	var licNum=pcapId.getCustomID();
	logDebug("Cap ID: " + pcapId + " " + "Custom ID: " + licNum);
	var newExpDate = new Date();
	var year=0;
	
	if(arguments.length==2)
	{
		logDebug("Inside renewal");
		b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
		if(b1ExpResult.getSuccess())
		{
			var b1Exp = b1ExpResult.getOutput();
			 var expDate = b1Exp.getExpDate();
			 if(expDate)
			 {
				year=expDate.getYear() +2 ;
			 }
		}
	}
	else
	{
		logDebug("Inside application");
		var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
		year=currentDate.getFullYear() + 1;	
	}
	
	logDebug("Year: " + year);
	
	newExpDate.setFullYear(year);
	newExpDate.setMonth(12);
	newExpDate.setDate(0);

	var eDate = newExpDate.getMonth() + 1 + "/" + newExpDate.getDate() + "/" + newExpDate.getFullYear(); //Adding 1 to the getMonth method to get the Dec
    //var expAADate = aa.date.parseDate(eDate);
	logDebug("Exp date: " + eDate);
	
	thisLic=new licenseObject(licNum,pcapId);
	thisLic.setExpiration(eDate);
	
	b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

    if (b1ExpResult.getSuccess())
    {
        var b1Exp = b1ExpResult.getOutput();
        if(b1Exp)
        {
            var expDate=b1Exp.getExpDate();
            if(expDate)
            {
                var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                logDebug("Updated Expiration Date: " + b1ExpDate);
            }
        } 
    }
		
	/*b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            //logDebug("Previous expiraton date: " +expDate);
            var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            var expYear = expDate.getYear();
            //logDebug("EXPPPP YEAR "+b1ExpDate);

            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            var yy=0;
            if((expYear%2)==0)
            {
                 yy = expYear + 2;

            }
            else
            {
                 yy=expYear + 1;
            }
            //logDebug("Expiration year: " + yy);
            newExpdate.setFullYear(yy);

            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            //logDebug("Updated renewal to " + expAADate);
        }

    } */   
}