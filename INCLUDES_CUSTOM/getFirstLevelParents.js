function getFirstLevelParents(itemCap,pAppType) 
	{
		getCapResult = aa.cap.getProjectByChildCapID(itemCap,'R',null);
        myArray = new Array();

		if (getCapResult.getSuccess())
		{
			parentArray = getCapResult.getOutput();
			if (parentArray.length)
			{
				for(x in parentArray)
				{
					var p = parentArray[x].getProjectID();
					var c = aa.cap.getCapID(p.getID1(),p.getID2(),p.getID3()).getOutput();
					if (pAppType != null)
					{
						//If parent type matches apType pattern passed in, add to return array
						if ( appMatch( pAppType, c ) )
							myArray.push(c);
					}
					else
						myArray.push(c);
				}		
				return myArray;
			}
			else
			{
				logDebug( "**WARNING: GetParent found no project parent for this application");
				return null;
			}
		}
		else
		{ 
			logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
			return null;
		}
	}

