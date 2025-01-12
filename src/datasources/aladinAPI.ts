import { RESTDataSource  } from "@apollo/datasource-rest";
import dotenv from 'dotenv';



dotenv.config({ path: '../../.env' }); // .env 파일 경로 설정

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

    async searchBooks(query: string) {
		try {
			console.log(query);
			const response = await this.get('ItemSearch.aspx', {
				params: {
					ttbkey: this.aladinApiKey, // API 키
					Query: query,              // 검색할 책 제목
					SearchTarget: 'Book',
					// MaxResults: 10,            // 검색 결과 수 제한
				}
			});

			return [response];

		} catch (error) {
			console.log(error);
			throw new Error('Failed to fetch books from Aladin API');
		}
    }
}