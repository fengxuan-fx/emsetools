function setExpirationDateForFarm(ID)
{
       logDebug("Inside setExpirationDateForFarm");
       var pcapId= ID
       logDebug("Parent ID: " + pcapId);
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
      // logDebug("Parent ID: " + pcapId);       
       
	   var newExpDate = new Date();
	   //Renewal
		if(arguments.length==2)					
		{
			logDebug("Set exp date for renewal");
			b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
			if (b1ExpResult.getSuccess())
			{
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
			   {
					var expDate=b1Exp.getExpDate();
					if(expDate)
					{
						var month=expDate.getMonth();
						var day=expDate.getDayOfMonth();
						var year=expDate.getYear() +1 ;
				
						newExpDate.setDate(day);
						newExpDate.setMonth(month-1);
						newExpDate.setFullYear(year);					
					}
			   }  
			}
		}
		//Application
		else						
		{
			logDebug("Set exp date for license");
			var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
			var year=currentDate.getFullYear() + 1;

			newExpDate.setFullYear(year);
			newExpDate.setMonth(3);
			newExpDate.setDate(30); 	
		}
	  
		var expDateString= newExpDate.getMonth() + 1+ "/" + newExpDate.getDate() + "/" + newExpDate.getFullYear();

		thisLic=new licenseObject(licNum,pcapId);
		thisLic.setExpiration(expDateString);
		
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
 }