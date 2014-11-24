
/* Comment out Non License Unit Condition Blocks
if (wfTask =="Plant Industry Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
*/
if (!publicUser) {
	if(!appMatch("Licenses/Plant/Agricultural Liming Material/License")){
		if (wfTask =="Plant Industry Review" && wfStatus == "Complete") {
	var limeBrand = loadASITable("LIME BRAND");
	if (limeBrand)
	{
	var tnValue = 0;
	var mesh10 = 0;
	var mesh100 = 0;
	if (typeof(limeBrand) == "object") 
		{
		
			for(k in limeBrand) 
			{
				logDebug("TNV Value" + (limeBrand[k]["TNV"]));
				logDebug("TNV Value p" + parseFloat(limeBrand[k]["TNV"]));
				if(limeBrand[k]["Type of Liming Material"] != "Wood Ash")
				{
					tnValue =  parseFloat(limeBrand[k]["TNV"]);
					if(tnValue < 60)
					{
						cancel = true;
						showMessage = true;
						comment("TNV value cannot be less than 60.");
					}
				}
				
				if(limeBrand[k]["Type of Liming Material"] == "Wood Ash")
				{
					tnValue =  parseFloat(limeBrand[k]["TNV"]);
					if(tnValue < 30)
					{
						cancel = true;
						showMessage = true;
						comment("TNV value for Wood Ash cannot be less than 30.");
					}
				}
				
				if(limeBrand[k]["Type of Liming Material"] != "Burned Lime" || limeBrand[k]["Type of Liming Material"] != "Hydrated Lime")
				{
					mesh10 =  parseFloat(limeBrand[k]["20 - Mesh"]);
					if(mesh10 < 80)
					{
						cancel = true;
						showMessage = true;
						comment("20 - Mesh value cannot be less than 80.");
					}
				}
				
				if(limeBrand[k]["Type of Liming Material"] != "Burned Lime" || limeBrand[k]["Type of Liming Material"] != "Hydrated Lime")
				{
					mesh100 =  parseFloat(limeBrand[k]["100 - Mesh"]);
					if(mesh100 < 30)
					{
						cancel = true;
						showMessage = true;
						comment("100 - Mesh value cannot be less than 30.");
					}
				}
			}
		}
	}
}
}
}