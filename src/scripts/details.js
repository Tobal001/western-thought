import { getParams } from "./utils/utils.mjs";
import philosophyData from "./storage/philosophyData.mjs";
import { pageDetails } from "./ui/uiDetailPage.mjs";

const philosophyId = getParams("id");
const philosophyType = getParams("type");
const dataSource = new philosophyData("western");

const details = new pageDetails(philosophyType, philosophyId, dataSource);
details.init();

