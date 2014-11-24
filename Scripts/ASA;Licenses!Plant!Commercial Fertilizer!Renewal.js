if (AInfo['Do any of your products contain micro-organisms?'] == "Yes" && !appHasCondition("License Checklist","Applied","Soil/Plant Inoculant License Required","Required")) {
	addStdCondition("License Checklist","Soil/Plant Inoculant License Required");
	}