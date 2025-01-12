import { AladinAPI } from "../datasources/aladinAPI";

export type DataSourceContext = {
	dataSources: {
		aladinAPI: AladinAPI
	};
}