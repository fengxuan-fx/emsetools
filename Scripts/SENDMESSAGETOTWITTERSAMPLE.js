//Sample of POST requestfunction updateTwitterStatus(){	var client = aa.oAuthClient;	var oauthProviderCode = 'TWITTER';	var url = 'https://aa.xxxxx.com/update.json';	var params = client.initPostParameters();	params.put('status', 'This is a message sent fromV360!');	var scripResult = client.post(oauthProviderCode, url, params);	if (scripResult.getSuccess())	{	    aa.print("Success: " + scripResult.getOutput());	}	else	{	    aa.print("Failure: " + scripResult.getErrorMessage());	}          }//Sample of Get requestfunction getHomeTimeline(){	var client = aa.oAuthClient;		var providerCode = 'TWITTER';	var url = 'https://aa.xxxxx.com/user_timeline.json';	var scripResult = client.get(providerCode, url);	if (scripResult.getSuccess())	{	    aa.print("Success: " + scripResult.getOutput());	}	else	{	    aa.print("Failure: " + scripResult.getErrorMessage());	}}