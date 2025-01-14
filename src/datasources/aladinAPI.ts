import { RESTDataSource  } from "@apollo/datasource-rest";
import type { AladinAPIBookItem, AladinAPISearchResponse, SearchOption } from '../types/interface/aladinAPI';
import dotenv from 'dotenv';

dotenv.config();

// aladinApiBaseUrl: string = 'https://www.aladin.co.kr/ttb/api/ItemList.aspx';
// aladinApiSearchUrl: string = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
// aladinApiLookUpUrl: string = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';


export class AladinAPI extends RESTDataSource{
    constructor() {
		super();
		this.baseURL = 'https://www.aladin.co.kr/ttb/api/';
    }

    get aladinApiKey(): string {
      	return process.env.ALADIN_API_KEY;
    }

    async searchBooks(searchOption: SearchOption): Promise<AladinAPIBookItem[]> {
		try {

			const aladinAPISearchResponseString: string = await this.get('ItemSearch.aspx', {
				params: {
					ttbkey: this.aladinApiKey,
					Query: searchOption.searchQuery,  
					QueryType: searchOption.queryType,
					SearchTarget: 'Book',
					Cover: 'Big',
					Sort: searchOption.sort,
					MaxResults: searchOption.maxResult,  
					output: 'JS'
				}
			});
	
			var cleanedString: string = aladinAPISearchResponseString.slice(0, -1).replace(/&amp;/g, '&').replace(/\\(?!["\\/bfnrtu])/g, '');

			const aladinAPISearchResponse: AladinAPISearchResponse = JSON.parse(cleanedString);
			const response: AladinAPIBookItem[] = aladinAPISearchResponse.item;
			return response;

		} catch (error) {
			console.log(error);
			throw new Error('Failed to fetch books from Aladin API');
		}
    }
}