var sumTotal =0;
if (typeof(SCHEDULECDAIRYINGREDIENTS)=="object") {
	for(thisRow in SCHEDULECDAIRYINGREDIENTS)sumTotal +=parseFloat(SCHEDULECDAIRYINGREDIENTS[thisRow]["Lbs of Milk Used"]);
	}

if (sumTotal>0) {
	editAppSpecific("Total Lbs of Milk Used",sumTotal);
	}

var sumTotal1 =0;
if (typeof(SCHEDULECDAIRYINGREDIENTS)=="object") {
	for(thisRow in SCHEDULECDAIRYINGREDIENTS)sumTotal1 +=parseFloat(SCHEDULECDAIRYINGREDIENTS[thisRow]["Lbs of Butterfat Used"]);
	}

if (sumTotal>0) {
	editAppSpecific("Total Lbs of Butterfat Used",sumTotal);
	}